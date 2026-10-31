#!/usr/bin/env python3
"""Restore private starter state in a fresh clone of a shared installation."""
from __future__ import annotations

import json
import hashlib
import os
from pathlib import Path
import secrets
import stat
import subprocess
import sys
import tempfile

ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from harness.state_domains import PRIVATE_GIT_PATHS, is_private_git_path, private_git_exclusions_effective
from script import adopt


class LocalBootstrapRefused(ValueError):
    pass


def _starter_files() -> dict[str,bytes]:
    project=json.loads((ROOT/"harness/project.json").read_text(encoding="utf-8"))
    if project.get("installation")!={"schema":1,"distribution":"shared"}:
        raise LocalBootstrapRefused("local initialization requires a shared installed harness")
    seed=json.loads((ROOT/"harness/local-state-seed.json").read_text(encoding="utf-8"))
    files=seed.get("files") if isinstance(seed,dict) and seed.get("schema")==1 else None
    if not isinstance(files,dict) or not files:
        raise LocalBootstrapRefused("shared installation has no private starter seed")
    required={"feature_list.json",".specify/feature.json",".agent-harness/state-domain.json"}
    if not required<=set(files):
        raise LocalBootstrapRefused("shared installation starter seed is incomplete")
    result={}
    for relative,content in files.items():
        if (not isinstance(relative,str) or not isinstance(content,str) or not is_private_git_path(relative)
                or relative.startswith("/") or "\\" in relative or any(part in {"",".","..",".git"} for part in relative.split("/"))):
            raise LocalBootstrapRefused("shared installation starter seed has an unsafe path")
        payload=content.encode("utf-8")
        if len(payload)>1_000_000:
            raise LocalBootstrapRefused("shared installation starter seed has an oversized file")
        result[relative]=payload
    return result


def _after_starter_write(_relative: str,_path: Path) -> None:
    """Test seam after an invocation-owned leaf is published."""

def _write_starter_payload(descriptor: int,payload: bytes) -> None:
    written=0
    while written<len(payload):
        count=os.write(descriptor,payload[written:])
        if count<=0: raise OSError("private starter write made no progress")
        written+=count
    os.fsync(descriptor)


def _rollback_starter_leaf(record: list, staging_fd: int) -> None:
    """Move a leaf into private staging before deciding whether we own it."""
    parent_fd,name,descriptor,identity,_,_,content_digest,*_=record
    try: visible=adopt._leaf_identity(os.stat(name,dir_fd=parent_fd,follow_symlinks=False))
    except (FileNotFoundError,NotADirectoryError): return
    if adopt._leaf_identity(os.fstat(descriptor))[:5]!=identity[:5]: return
    recovered="rollback-leaf-"+secrets.token_hex(16)
    try:
        adopt._rename_noreplace(Path(name),Path(recovered),source_directory=parent_fd,
                                destination_directory=staging_fd,source_identity=visible)
    except (OSError,adopt.AdoptionRefused): return
    moved=adopt._leaf_identity(os.stat(recovered,dir_fd=staging_fd,follow_symlinks=False))
    if moved[:5]==identity[:5] and adopt._leaf_identity(os.fstat(descriptor))[:5]==identity[:5]:
        staged=os.open(recovered,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=staging_fd)
        try:
            opened=os.fstat(staged)
            digest=hashlib.sha256(); total=0
            while chunk:=os.read(staged,1024*1024):
                total+=len(chunk)
                if total>1_000_000: break
                digest.update(chunk)
            if (stat.S_ISREG(opened.st_mode) and total<=1_000_000
                    and adopt._leaf_identity(opened)[:5]==moved[:5]
                    and adopt._leaf_identity(os.fstat(staged))[:5]==moved[:5]
                    and adopt._leaf_identity(os.stat(recovered,dir_fd=staging_fd,follow_symlinks=False))[:5]==moved[:5]
                    and digest.hexdigest()==content_digest):
                os.unlink(recovered,dir_fd=staging_fd)
                return
        finally: os.close(staged)
    try:
        adopt._rename_noreplace(Path(recovered),Path(name),source_directory=staging_fd,
                                destination_directory=parent_fd,source_identity=moved)
    except (OSError,adopt.AdoptionRefused):
        print("concurrent owner replacement preserved in private bootstrap recovery staging",file=sys.stderr)


def bootstrap() -> None:
    files=_starter_files()
    tracked=subprocess.run(["git","--literal-pathspecs","ls-files","-z","--",*PRIVATE_GIT_PATHS],
                           cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if tracked.returncode or tracked.stdout:
        raise LocalBootstrapRefused("private feature state is tracked; local initialization refused")
    exclude=adopt.private_exclude_path(ROOT)
    prior=adopt.private_exclude_state(exclude)
    updated=adopt.private_exclusion_content(prior[0],adopt.shared_exclusion_rules())
    leaves=[]; created_leaves=[]; parents=[]
    staging=Path(tempfile.mkdtemp(prefix="local-bootstrap-",dir=exclude.parent))
    try:
        staging_fd=os.open(staging,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
        published=prior
        try:
            published=adopt._publish_exclude(exclude,prior,updated) if updated!=prior[0] else prior
            if not private_git_exclusions_effective(ROOT):
                raise LocalBootstrapRefused("repository ignore rules expose private feature state")
            for relative,payload in sorted(files.items()):
                with adopt._attached_parent(ROOT,relative,create_missing=True,created=parents,creation_directory=staging_fd) as (parent_fd,parent_identities):
                    name=Path(relative).name
                    try:
                        visible=os.stat(name,dir_fd=parent_fd,follow_symlinks=False)
                    except FileNotFoundError:
                        visible=None
                    if visible is not None:
                        if not stat.S_ISREG(visible.st_mode):
                            raise LocalBootstrapRefused("existing private starter path is not a regular file")
                        descriptor=os.open(name,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=parent_fd)
                        opened=os.fstat(descriptor)
                        identity=adopt._leaf_identity(opened)
                        if not stat.S_ISREG(opened.st_mode) or adopt._leaf_identity(visible)!=identity:
                            os.close(descriptor)
                            raise LocalBootstrapRefused("existing private starter file changed during initialization")
                        leaves.append([os.dup(parent_fd),name,descriptor,identity,relative,parent_identities,None,False])
                        continue
                    staged_name="starter-"+secrets.token_hex(16)
                    descriptor=os.open(staged_name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_NOFOLLOW",0),0o600,dir_fd=staging_fd)
                    record=None
                    try:
                        _write_starter_payload(descriptor,payload)
                        record=[os.dup(parent_fd),name,os.dup(descriptor),adopt._leaf_identity(os.fstat(descriptor)),relative,parent_identities,hashlib.sha256(payload).hexdigest(),True]
                        leaves.append(record)
                        created_leaves.append(record)
                        adopt._rename_noreplace(Path(staged_name),Path(name),source_directory=staging_fd,
                                                destination_directory=parent_fd,source_identity=record[3])
                    finally:
                        if record is not None: record[3]=adopt._leaf_identity(os.fstat(descriptor))
                        try:
                            if adopt._leaf_identity(os.stat(staged_name,dir_fd=staging_fd,follow_symlinks=False))[:5]==adopt._leaf_identity(os.fstat(descriptor))[:5]:
                                os.unlink(staged_name,dir_fd=staging_fd)
                        except FileNotFoundError: pass
                        os.close(descriptor)
                _after_starter_write(relative,ROOT/relative)
            if not private_git_exclusions_effective(ROOT):
                raise LocalBootstrapRefused("repository ignore rules expose restored private feature state")
            for parent_fd,name,descriptor,identity,relative,parent_identities,_digest,_created in leaves:
                with adopt._attached_parent(ROOT,relative,parent_identities) as (visible_parent,_):
                    if (adopt._directory_identity(os.fstat(visible_parent))!=adopt._directory_identity(os.fstat(parent_fd))
                            or adopt._leaf_identity(os.fstat(descriptor))!=identity
                            or adopt._leaf_identity(os.stat(name,dir_fd=visible_parent,follow_symlinks=False))!=identity):
                        raise LocalBootstrapRefused("private starter file changed during initialization")
        except BaseException:
            for record in reversed(created_leaves): _rollback_starter_leaf(record,staging_fd)
            adopt._rollback_created_parents(parents,staging_fd)
            retained_state=any(os.path.lexists(ROOT/relative) for relative in PRIVATE_GIT_PATHS)
            if published!=prior and not retained_state and adopt.private_exclude_state(exclude)==published:
                adopt._publish_exclude(exclude,published,prior[0])
            raise
        finally:
            for parent_fd,_,descriptor,_,_,_,_,_ in leaves:
                os.close(descriptor); os.close(parent_fd)
            adopt._close_created_parents(parents)
            os.close(staging_fd)
    finally:
        try: staging.rmdir()
        except OSError:
            print(f"private bootstrap recovery staging preserved: {staging}",file=sys.stderr)


def main() -> int:
    try:
        if sys.argv[1:] == ["--check-shared"]:
            _starter_files()
            return 0
        bootstrap()
    except (LocalBootstrapRefused,adopt.AdoptionRefused,OSError,ValueError,UnicodeError,json.JSONDecodeError) as exc:
        print(f"BLOCK_LOCAL_BOOTSTRAP: {exc}",file=sys.stderr)
        return 65
    print("private feature state and repository-local Git exclusions are ready")
    return 0


if __name__=="__main__": raise SystemExit(main())
