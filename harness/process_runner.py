"""Bounded, streaming process execution shared by harness controllers."""
from __future__ import annotations

import hashlib
import os
from pathlib import Path
import signal
import subprocess
import threading
import time
from typing import Any, Sequence


class PopenOwner:
    """Publish process ownership before ``Popen.__init__`` can create a child."""

    def __init__(self) -> None:
        self.process: subprocess.Popen[bytes] | None=None
        self.process_group: int | None=None


class _OwnedPopen(subprocess.Popen):
    """A Popen whose partially initialized instance is always recoverable."""

    def __new__(cls, owner: PopenOwner, *args: Any, **kwargs: Any):
        instance=super().__new__(cls)
        owner.process=instance
        instance._harness_owner=owner
        return instance

    def __init__(self, owner: PopenOwner, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args,**kwargs)

    def __setattr__(self, name: str, value: Any) -> None:
        # Popen assigns the child PID before returning. Retain the intended
        # start_new_session group in the independent owner at that first
        # assignment, so an asynchronous exception cannot strand the child in
        # either the constructor-return or caller-assignment window.
        if name=="pid" and isinstance(value,int) and not isinstance(value,bool) and value>0:
            owner=getattr(self,"_harness_owner",None)
            if isinstance(owner,PopenOwner): owner.process_group=value
        super().__setattr__(name,value)


def spawn_owned_process(owner: PopenOwner, *args: Any, **kwargs: Any) -> subprocess.Popen[bytes]:
    if kwargs.get("start_new_session") is not True:
        raise ValueError("owned process launch requires a fresh session")
    if owner.process is not None or owner.process_group is not None:
        raise ValueError("process owner cannot be reused")
    return _OwnedPopen(owner,*args,**kwargs)


def _process_group_id(process: subprocess.Popen[bytes]) -> int:
    return process.pid


def _write_sink(sink: Any, chunk: bytes) -> None:
    """Write bytes to either a binary sink or a normal text stream."""
    target=getattr(sink,"buffer",sink)
    try:
        target.write(chunk)
    except TypeError:
        sink.write(chunk.decode("utf-8",errors="replace"))
    sink.flush()


def run_bounded_argv(
    argv: Sequence[str], *, cwd: str | Path, timeout_seconds: int,
    aggregate_out: Any=None, aggregate_err: Any=None,
    stdout_sink: Any=None, stderr_sink: Any=None, env: dict[str,str] | None=None,
    termination_grace_seconds: int=1,
) -> tuple[int,str,str,int]:
    """Run one argv without unbounded capture and terminate its whole group.

    A timed-out command receives a terminal status of 124. Output is hashed
    while it streams, so callers retain durable evidence without retaining an
    unbounded in-memory transcript.
    """
    if isinstance(timeout_seconds,bool) or not isinstance(timeout_seconds,int) or not 1<=timeout_seconds<=3600:
        raise ValueError("process timeout must be an integer from 1 through 3600")
    if isinstance(termination_grace_seconds,bool) or not isinstance(termination_grace_seconds,int) or not 1<=termination_grace_seconds<=10:
        raise ValueError("process termination grace must be an integer from 1 through 10")
    started=time.monotonic(); out_hash=hashlib.sha256(); err_hash=hashlib.sha256()
    owner=PopenOwner()
    process: subprocess.Popen[bytes] | None=None
    process_group: int | None=None
    threads: list[threading.Thread]=[]
    started_threads: list[threading.Thread]=[]
    sink_errors: list[str]=[]

    def pump(stream: Any, sink: Any, digest: Any, aggregate: Any) -> None:
        sink_healthy=True
        read_chunk=getattr(stream,"read1",stream.read)
        try:
            while True:
                chunk=read_chunk(16384)
                if not chunk: break
                digest.update(chunk)
                if aggregate is not None: aggregate.update(chunk)
                if sink is not None and sink_healthy:
                    try: _write_sink(sink,chunk)
                    except Exception:
                        sink_healthy=False; sink_errors.append("output sink failed")
        except Exception:
            sink_errors.append("output stream read failed")
            source_failure.set()
        finally:
            try: stream.close()
            except OSError: pass

    def stop_group() -> bool:
        """Bound shutdown even if a child becomes uninterruptible."""
        current=process if process is not None else owner.process
        group=process_group if process_group is not None else owner.process_group
        pid=getattr(current,"pid",None) if current is not None else None
        if group is None and isinstance(pid,int) and not isinstance(pid,bool) and pid>0: group=pid
        if current is None and group is None: return True
        cleanup_error: BaseException | None=None
        reaped=False

        def remember(error: BaseException) -> None:
            nonlocal cleanup_error
            if cleanup_error is None: cleanup_error=error

        if group is not None:
            try: os.killpg(group,signal.SIGTERM)
            except (ProcessLookupError,PermissionError): pass
            except BaseException as error: remember(error)
        if current is not None:
            try:
                current.wait(timeout=termination_grace_seconds); reaped=True
            except subprocess.TimeoutExpired: pass
            except BaseException as error: remember(error)
        # The leader can exit after TERM while a descendant retains the pipes.
        if group is not None:
            try: os.killpg(group,signal.SIGKILL)
            except (ProcessLookupError,PermissionError): pass
            except BaseException as error: remember(error)
        if current is not None:
            try:
                current.wait(timeout=1); reaped=True
            except subprocess.TimeoutExpired: pass
            except BaseException as error: remember(error)
        # A BaseException may interrupt Popen before all of its wait machinery
        # is initialized. The independently retained PID is still our child and
        # can be reaped directly without an unbounded wait.
        if not reaped and isinstance(group,int) and not isinstance(group,bool) and group>0:
            deadline=time.monotonic()+1
            while time.monotonic()<deadline:
                try:
                    waited,_status=os.waitpid(group,os.WNOHANG)
                except ChildProcessError:
                    reaped=True; break
                except BaseException as error:
                    remember(error); break
                if waited==group:
                    reaped=True; break
                time.sleep(0.01)
        for thread in started_threads:
            try: thread.join(timeout=2)
            except BaseException as error: remember(error)
        for stream in ((getattr(current,"stdout",None),getattr(current,"stderr",None)) if current is not None else (None,None)):
            if stream is None: continue
            try: stream.close()
            except OSError: pass
            except BaseException as error: remember(error)
        threads_alive=False
        for thread in started_threads:
            try: threads_alive=thread.is_alive() or threads_alive
            except BaseException as error:
                threads_alive=True; remember(error)
        if cleanup_error is not None: raise cleanup_error
        return reaped and not threads_alive

    try:
        process=spawn_owned_process(owner,list(argv),cwd=cwd,env=env,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True)
        process_group=_process_group_id(process)
        # Construct the coordination primitive only after the owned process
        # exists. If startup is interrupted here, the BaseException handler
        # can still terminate and reap that exact process group.
        source_failure=threading.Event()
        threads=[
            threading.Thread(target=pump,args=(process.stdout,stdout_sink,out_hash,aggregate_out),daemon=True),
            threading.Thread(target=pump,args=(process.stderr,stderr_sink,err_hash,aggregate_err),daemon=True),
        ]
        for thread in threads:
            start_returned=False
            try:
                thread.start(); start_returned=True
            finally:
                if start_returned or thread.ident is not None: started_threads.append(thread)
        deadline=time.monotonic()+timeout_seconds
        forced_status: int | None=None
        while process.poll() is None and not source_failure.is_set() and time.monotonic()<deadline:
            time.sleep(0.02)
        if process.poll() is None:
            forced_status=74 if source_failure.is_set() else 124
            if not stop_group():
                return 74,out_hash.hexdigest(),err_hash.hexdigest(),round((time.monotonic()-started)*1000)
        status=process.poll()
        if status is None:
            try: status=process.wait(timeout=1)
            except subprocess.TimeoutExpired:
                stop_group()
                return 74,out_hash.hexdigest(),err_hash.hexdigest(),round((time.monotonic()-started)*1000)
        for thread in started_threads: thread.join(timeout=2)
        if any(thread.is_alive() for thread in started_threads):
            stop_group(); forced_status=74
        if forced_status is not None: status=forced_status
        elif sink_errors and status==0: status=74
        return status,out_hash.hexdigest(),err_hash.hexdigest(),round((time.monotonic()-started)*1000)
    except BaseException:
        try: stop_group()
        except BaseException: pass
        raise
