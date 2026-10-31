"""Bounded transport for controller-owned serial review adapters."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import stat
import tempfile
from typing import Any, Sequence

from .process_runner import run_bounded_argv

MAX_MANIFEST_BYTES=1_000_000
MAX_RESULT_BYTES=1_000_000
MAX_ARG_BYTES=1024
ADAPTER_FAILURE_CODES=frozenset({
    "BLOCK_REVIEW_ADAPTER_CLI_UNAVAILABLE",
    "BLOCK_REVIEW_ADAPTER_AUTH_REQUIRED",
    "BLOCK_REVIEW_ADAPTER_EXEC_UNAVAILABLE",
    "BLOCK_REVIEW_ADAPTER_MODEL_UNSUPPORTED",
    "BLOCK_REVIEW_ADAPTER_MODEL_FAILED",
    "BLOCK_REVIEW_ADAPTER_REPORT_INVALID",
    "BLOCK_REVIEW_ADAPTER_RECORD_REJECTED",
})

# Review adapters inspect untrusted repository content.  Give them only the
# process settings needed to locate the configured runtime and the controller
# profile; never forward arbitrary credentials or service tokens from the
# parent agent.
REVIEW_ENVIRONMENT_KEYS=frozenset({
    "PATH","HOME","USER","LOGNAME","SHELL","TMPDIR","LANG","LC_ALL",
    "LC_CTYPE","TERM","TERM_PROGRAM","COLORTERM","NO_COLOR","FORCE_COLOR",
    "XDG_CONFIG_HOME","XDG_CACHE_HOME","XDG_DATA_HOME","SSL_CERT_FILE",
    "SSL_CERT_DIR","REQUESTS_CA_BUNDLE","CODEX_CLI_PATH","CODEX_VERSION",
    "CODEX_INTERNAL_ORIGINATOR_OVERRIDE","CODEX_CI",
    "HARNESS_CONTROLLER_PROFILE_HOME","PYTHONDONTWRITEBYTECODE",
})


def review_adapter_environment(environ: dict[str,str], state_domain: object) -> dict[str,str]:
    """Return the fixed, credential-free environment allowed for adapters."""
    environment={key:value for key,value in environ.items()
                 if key in REVIEW_ENVIRONMENT_KEYS and isinstance(value,str)}
    environment["AGENT_HARNESS_STATE_DOMAIN"]=str(state_domain or "application")
    environment["PYTHONDONTWRITEBYTECODE"]="1"
    return environment


def review_dispatch_config_errors(value: object) -> list[str]:
    if (type(value) is not dict or set(value)!={"schema","adapter","timeout_seconds"}
            or type(value.get("schema")) is not int or value.get("schema")!=1):
        return ["harness/review-dispatch.json must contain exactly schema, adapter, and timeout_seconds"]
    argv=value.get("adapter")
    if (type(argv) is not list or not 1<=len(argv)<=12 or
            any(type(part) is not str or not part or len(part.encode("utf-8"))>MAX_ARG_BYTES or
                any(ord(char)<32 or ord(char)==127 for char in part) or
                any(token in part.replace("{python}","").replace("{runtime}","").replace("{root}","") for token in ("{","}")) for part in argv)):
        return ["review adapter must be a bounded argv with only supported placeholders"]
    if argv and Path(argv[0]).name.casefold() in {"sh","bash","zsh","dash","ksh","pwsh","powershell","cmd","cmd.exe"}:
        return ["review adapter must be invoked directly without a shell"]
    if type(value.get("timeout_seconds")) is not int or not 1<=value["timeout_seconds"]<=3600:
        return ["review adapter timeout_seconds must be an integer from 1 through 3600"]
    return []


def adapter_config_digest(path: Path) -> str:
    raw=_read_regular_bytes(path,64*1024)
    value=json.loads(raw.decode("utf-8"),object_pairs_hook=_reject_duplicate_keys)
    errors=review_dispatch_config_errors(value)
    if errors:
        raise ValueError("BLOCK_REVIEW_ADAPTER_CONFIG_INVALID: "+"; ".join(errors))
    return hashlib.sha256(raw).hexdigest()


def _read_regular_bytes(path: Path, maximum: int) -> bytes:
    descriptor=os.open(path,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0))
    try:
        before=os.fstat(descriptor)
        if not stat.S_ISREG(before.st_mode) or before.st_size>maximum:
            raise ValueError("file is unsafe or oversized")
        chunks=[]; size=0
        while True:
            chunk=os.read(descriptor,min(65536,maximum+1-size))
            if not chunk: break
            chunks.append(chunk); size+=len(chunk)
            if size>maximum: raise ValueError("file is oversized")
        after=os.fstat(descriptor)
        identity=lambda metadata:(metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns)
        if identity(before)!=identity(after): raise ValueError("file changed while being read")
        return b"".join(chunks)
    finally:
        os.close(descriptor)


def _read_json_file(path: Path, maximum: int) -> dict[str,Any]:
    value=json.loads(_read_regular_bytes(path,maximum).decode("utf-8"),object_pairs_hook=_reject_duplicate_keys)
    if type(value) is not dict: raise ValueError("JSON value is not an object")
    return value


def run_review_adapter(
    *, root: Path, runtime_root: Path, config_path: Path, action: str,
    manifest: dict[str,Any], python_executable: str, environ: dict[str,str],
) -> tuple[dict[str,Any] | None,str | None]:
    """Run one adapter action with bounded, private manifest/result files."""
    if action not in {"preflight","precommit","dispatch"}:
        return None,"BLOCK_REVIEW_ADAPTER_ACTION_INVALID"
    try:
        config=_read_json_file(config_path,64*1024)
    except (OSError,UnicodeError,json.JSONDecodeError,ValueError):
        return None,"BLOCK_REVIEW_ADAPTER_CONFIG_UNAVAILABLE"
    errors=review_dispatch_config_errors(config)
    if errors:
        return None,"BLOCK_REVIEW_ADAPTER_CONFIG_INVALID: "+"; ".join(errors)
    try:
        payload=(json.dumps(manifest,sort_keys=True,separators=(",",":"),ensure_ascii=True,allow_nan=False)+"\n").encode("utf-8")
        if len(payload)>MAX_MANIFEST_BYTES:
            return None,"BLOCK_REVIEW_ADAPTER_MANIFEST_TOO_LARGE"
        with tempfile.TemporaryDirectory(prefix="harness-review-") as temporary:
            directory=Path(temporary); manifest_path=directory/"manifest.json"; result_path=directory/"result.json"
            manifest_path.write_bytes(payload); os.chmod(manifest_path,0o600)
            replacements={"{python}":python_executable,"{runtime}":str(runtime_root),"{root}":str(root)}
            argv=[part.replace("{python}",python_executable)
                      .replace("{runtime}",str(runtime_root))
                      .replace("{root}",str(root))
                  for part in config["adapter"]]
            argv.extend([action,"--manifest",str(manifest_path),"--result",str(result_path)])
            environment=review_adapter_environment(environ,manifest.get("state_domain","application"))
            status,_stdout_digest,_stderr_digest,_duration=run_bounded_argv(
                argv,cwd=root,timeout_seconds=config["timeout_seconds"],env=environment,
                termination_grace_seconds=5,
            )
            if status:
                if status!=124:
                    try:
                        failure=_read_json_file(result_path,MAX_RESULT_BYTES)
                        if (set(failure)=={"schema","status","reason"} and failure.get("schema")==1
                                and failure.get("status")=="failed" and failure.get("reason") in ADAPTER_FAILURE_CODES):
                            return None,failure["reason"]
                    except (OSError,UnicodeError,json.JSONDecodeError,ValueError):
                        pass
                return None,"BLOCK_REVIEW_ADAPTER_"+("TIMEOUT" if status==124 else "FAILED")
            result=_read_json_file(result_path,MAX_RESULT_BYTES)
            if type(result.get("schema")) is not int or result.get("schema")!=1:
                return None,"BLOCK_REVIEW_ADAPTER_RESULT_INVALID"
            return result,None
    except (OSError,UnicodeError,json.JSONDecodeError,ValueError,TypeError):
        return None,"BLOCK_REVIEW_ADAPTER_RESULT_INVALID"


def _reject_duplicate_keys(pairs: Sequence[tuple[str,Any]]) -> dict[str,Any]:
    result={}
    for key,value in pairs:
        if key in result:
            raise ValueError("duplicate JSON key")
        result[key]=value
    return result
