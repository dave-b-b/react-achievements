#!/usr/bin/env python3
"""Plan and apply non-destructive in-place harness adoption."""
from __future__ import annotations
import argparse
from contextlib import contextmanager
import ctypes
import errno
import hashlib
import importlib.util
import json
import os
from pathlib import Path, PurePosixPath
import re
import secrets
import shutil
import stat
import subprocess
import sys
import tempfile
from typing import Any, Callable

ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from harness.installation_packaging import BATCH_ARTIFACTS,validate_batch_packaging as shared_validate_batch_packaging
from harness import state_domains
from harness.state_domains import is_private_git_path, private_git_exclusion_rules, private_git_exclusions_effective

_CANONICAL_HARNESS_SPEC=importlib.util.spec_from_file_location("canonical_harness",ROOT/"script/harness.py")
if _CANONICAL_HARNESS_SPEC is None or _CANONICAL_HARNESS_SPEC.loader is None:
    raise ImportError("canonical harness module cannot be loaded")
canonical_harness=importlib.util.module_from_spec(_CANONICAL_HARNESS_SPEC)
_CANONICAL_HARNESS_SPEC.loader.exec_module(canonical_harness)

MANIFEST_PATH=ROOT/"harness/adoption-manifest.json"
ROLES={"router","contract","state","executable","documentation"}
POLICIES={"side_by_side","merge_required","never_overwrite"}
ENTRY_KEYS={"path","role","collision_policy","side_by_side_name","required"}
FORBIDDEN_TEXT=re.compile(r"(?:\$\{|\$\(|`|(?:^|[_-])(command|commands|shell|argv)(?:$|[_-]))",re.I)
WILDCARD=re.compile(r"[*?\[\]{}]")
PRIVATE_BEGIN="# BEGIN repository-harness private adoption"
PRIVATE_END="# END repository-harness private adoption"
SENSITIVE_COMPONENT=re.compile(r"(?:\.env(?:\..+)?|id_rsa|id_ed25519|\.netrc|\.npmrc|\.pypirc|credentials(?:\.json)?|client-secret\.json|private[_-]?key(?:\.pem)?|[^/]+\.p(?:12|fx))$",re.I)
SAFE_FIXTURE_SUFFIXES=(".example",".sample",".template")
_GENERATED_CAPABILITY=object()
MAX_ADOPTION_SOURCE_BYTES=16*1024*1024
PROVENANCE_ARTIFACTS=("harness/adoption-manifest.json","harness/version.json","script/adopt.py")
APPLICATION_SPEC_ROOT="specs/001-repository-initialization/"
TEMPLATE_MAINTENANCE_PREFIXES=("harness/attestations/","harness/requests/","harness/reviews/")

MAX_PRIVATE_EXCLUDE_BYTES=1024*1024
V2_STATE_ROOT = ".agent-harness"
V2_MIGRATION_ID = "v1-to-v2-state-separation"
V2_OWNER_PATHS = {"AGENTS.md", "ARCHITECTURE.md", "README.md", "PROGRESS.md", "feature_list.json", ".specify/feature.json"}
UPDATEABLE_V2_TARGETS = {"absent", "1.5.0", "1.6.0", "2.0.0", "2.1.0", "2.1.1", "2.1.2", "2.2.0", "2.3.0", "2.3.1", "2.4.0", "2.5.0", "2.5.1", "2.5.2", "2.5.3"}
DISTRIBUTIONS={"shared","personal"}
HARNESS_BOOTSTRAP={
    ".agent-harness/feature_list.json":b'{\n  "schema": 1,\n  "features": []\n}\n',
    ".agent-harness/PROGRESS.md":b"# Harness Maintenance Progress\n\n- Harness state domain initialized for v2.0.0.\n- Application repository state remains authoritative at the repository root.\n",
    ".agent-harness/state-domain.json":(ROOT/"harness/state-domain.json").read_bytes(),
}
LEGACY_STATE_DOMAIN_BOOTSTRAP=b'{\n  "schema": 1,\n  "version": "2.0.0",\n  "root": ".agent-harness",\n  "application_root": ".",\n  "cross_domain_references": "forbidden"\n}\n'

def _recognized_previous_state_domain(payload: bytes) -> bool:
    """Recognize the full predecessor marker without accepting owner edits."""
    try:
        previous=json.loads(payload.decode("utf-8"),object_pairs_hook=canonical_harness._reject_duplicate_json_keys)
        current=json.loads(HARNESS_BOOTSTRAP[".agent-harness/state-domain.json"].decode("utf-8"))
        current["separation"].pop("private_git_paths")
        return previous==current
    except (UnicodeError,json.JSONDecodeError,ValueError,KeyError,TypeError):
        return False

class AdoptionRefused(ValueError): pass

def validate_batch_packaging(root: Path) -> tuple | None:
    try: return shared_validate_batch_packaging(root)
    except ValueError as error: raise AdoptionRefused(str(error)) from error

def private_target_manifest_index_guard(root: Path,manifest: dict[str,Any]) -> None:
    """Refuse private publication over any target-owned tracked artifact."""
    paths=sorted(item["path"] for item in manifest["artifacts"] if not is_private_git_path(item["path"]))
    result=subprocess.run(["git","--literal-pathspecs","ls-files","-z","--",*paths],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
    if result.returncode: raise AdoptionRefused("private adoption target index could not be checked safely")
    if result.stdout: raise AdoptionRefused("private adoption refuses tracked target harness artifacts")

def reject_installed_batch_artifacts(root: Path) -> None:
    """Old batch runtime is owner data, so refuse rather than deleting it."""
    present=[relative for relative in BATCH_ARTIFACTS if os.path.lexists(root/relative)]
    if present: raise AdoptionRefused("installed repository retains template-only batch artifacts; remove or preserve them outside installation before retrying")

def sensitive_source_path(relative: str) -> bool:
    parts=PurePosixPath(relative).parts
    for index,part in enumerate(parts):
        if not SENSITIVE_COMPONENT.fullmatch(part): continue
        if index==len(parts)-1 and part.lower().endswith(SAFE_FIXTURE_SUFFIXES): continue
        return True
    return False

def git_visible_paths(root: Path) -> set[str]:
    repository=subprocess.run(["git","rev-parse","--show-toplevel"],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True)
    if repository.returncode or Path(repository.stdout.strip()).resolve()!=root.resolve():
        raise AdoptionRefused("adoption source must be the Git worktree root with a distributable Git inventory")
    listed=subprocess.run(["git","ls-files","-z","--cached","--others","--exclude-standard"],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
    if listed.returncode: raise AdoptionRefused("adoption source Git inventory could not be captured safely")
    paths=set()
    for raw in listed.stdout.split(b"\0"):
        if not raw: continue
        relative=os.fsdecode(raw); path=PurePosixPath(relative)
        if not safe_path(relative) or any(0xD800<=ord(character)<=0xDFFF for character in relative): raise AdoptionRefused("adoption source Git inventory contains an unsafe path")
        paths.add(path.as_posix())
    return paths

def source_path_allowed(root: Path,relative: str,allowset: set[str]|None=None,*,trusted_generated: bool=False) -> bool:
    if allowset is not None and relative not in allowset: return False
    if allowset is None and not trusted_generated: raise AdoptionRefused("adoption source requires a captured Git inventory")
    if sensitive_source_path(relative):
        raise AdoptionRefused("adoption source contains a sensitive credential path")
    return True

def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def _planned_source_bytes(root: Path,relative: str,expected_digest: str|None, *, _snapshot: bool=False) -> tuple:
    """Read exactly the planned source through a descriptor-bound no-follow path."""
    if not safe_path(relative) or (expected_digest is None and not _snapshot) or (expected_digest is not None and (not isinstance(expected_digest,str) or not re.fullmatch(r"[0-9a-f]{64}",expected_digest))): raise AdoptionRefused("adoption source plan is invalid")
    directory=None; descriptor=None; directories=[]; attachments=[]
    identity=lambda metadata:(metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns,metadata.st_ctime_ns)
    try:
        directory=os.open(root,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
        directories.append(directory); root_identity=identity(os.fstat(directory))
        for part in PurePosixPath(relative).parts[:-1]:
            child=os.open(part,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=directory); metadata=os.fstat(child)
            if not stat.S_ISDIR(metadata.st_mode): os.close(child); raise AdoptionRefused("adoption source path is unsafe")
            directories.append(child); attachments.append((directory,part,child,identity(metadata))); directory=child
        name=PurePosixPath(relative).name
        before_path=os.stat(name,dir_fd=directory,follow_symlinks=False)
        descriptor=os.open(name,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=directory); before=os.fstat(descriptor)
        if not stat.S_ISREG(before.st_mode) or before.st_size>MAX_ADOPTION_SOURCE_BYTES or identity(before)!=identity(before_path): raise AdoptionRefused("adoption source is not a bounded regular file")
        payload=bytearray(); digest_value=hashlib.sha256()
        while True:
            block=os.read(descriptor,65536)
            if not block: break
            payload.extend(block)
            if len(payload)>MAX_ADOPTION_SOURCE_BYTES: raise AdoptionRefused("adoption source is not a bounded regular file")
            digest_value.update(block)
        after=os.fstat(descriptor)
        if identity(before)!=identity(after) or identity(before)!=identity(os.stat(name,dir_fd=directory,follow_symlinks=False)) or (expected_digest is not None and digest_value.hexdigest()!=expected_digest): raise AdoptionRefused(f"adoption source changed after planning: {relative}")
        if root_identity!=identity(os.fstat(directories[0])) or root_identity!=identity(os.stat(root,follow_symlinks=False)):
            raise AdoptionRefused("adoption source root changed while reading")
        for parent,name,child,expected in attachments:
            if expected!=identity(os.fstat(child)) or expected!=identity(os.stat(name,dir_fd=parent,follow_symlinks=False)):
                raise AdoptionRefused("adoption source parent changed while reading")
        # Ancestor attachment identities survive our own sibling publications;
        # the file token retains ctime so same-content replacement/edit refuses.
        snapshot=(tuple([root_identity[:3],*[entry[3][:3] for entry in attachments]]),identity(after),digest_value.hexdigest())
        return (bytes(payload),stat.S_IMODE(before.st_mode),snapshot) if _snapshot else (bytes(payload),stat.S_IMODE(before.st_mode))
    except (OSError,AdoptionRefused) as exc:
        if isinstance(exc,AdoptionRefused): raise
        raise AdoptionRefused(f"adoption source path is unsafe: {relative}") from exc
    finally:
        if descriptor is not None: os.close(descriptor)
        for directory in reversed(directories): os.close(directory)


def _target_snapshot(root: Path, relative: str) -> tuple:
    return _planned_source_bytes(root,relative,None,_snapshot=True)[2]


def _existing_parent_snapshot(root: Path, relative: str) -> tuple:
    """Bind every pre-existing no-follow ancestor, even when the leaf is absent."""
    descriptors=[]; attachments=[]; identities=[]
    identity=lambda metadata:(metadata.st_dev,metadata.st_ino,metadata.st_mode)
    try:
        if not safe_path(relative): raise AdoptionRefused("update target path is unsafe")
        directory=os.open(root,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
        descriptors.append(directory); identities.append(identity(os.fstat(directory)))
        for part in PurePosixPath(relative).parts[:-1]:
            try: child=os.open(part,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=directory)
            except FileNotFoundError: break
            descriptors.append(child); identities.append(identity(os.fstat(child))); attachments.append((directory,part,child)); directory=child
        if identity(os.stat(root,follow_symlinks=False))!=identities[0]: raise AdoptionRefused("update target root changed while planning")
        for parent,name,child in attachments:
            if identity(os.stat(name,dir_fd=parent,follow_symlinks=False))!=identity(os.fstat(child)): raise AdoptionRefused("update target parent changed while planning")
        return tuple(identities)
    except OSError as exc:
        raise AdoptionRefused(f"update target parent is unsafe: {relative}") from exc
    finally:
        for descriptor in reversed(descriptors): os.close(descriptor)


def _same_owned_file(first: tuple, second: tuple) -> bool:
    # A rename may change ctime, but never ownership, inode, mode, mtime or bytes.
    return first[1][:5]==second[1][:5] and first[2]==second[2]


def _require_target_snapshot(root: Path, relative: str, expected: tuple) -> tuple:
    current=_target_snapshot(root,relative)
    if current!=expected: raise AdoptionRefused(f"target identity or content changed after planning: {relative}")
    return current

def safe_path(value: Any) -> bool:
    if not isinstance(value,str) or not value or "\\" in value or WILDCARD.search(value): return False
    path=PurePosixPath(value)
    return not path.is_absolute() and all(part not in {"",".",".."} for part in path.parts) and path.parts[0]!=".git"

def _contains_executable_data(value: Any,key: str="") -> bool:
    if FORBIDDEN_TEXT.search(key): return True
    if isinstance(value,dict): return any(_contains_executable_data(child,str(name)) for name,child in value.items())
    if isinstance(value,list): return any(_contains_executable_data(child,key) for child in value)
    return isinstance(value,str) and bool(FORBIDDEN_TEXT.search(value))

def load_manifest(path: Path=MANIFEST_PATH,source_root: Path=ROOT) -> dict[str,Any]:
    try: value=json.loads(path.read_text(encoding="utf-8"))
    except (OSError,UnicodeError,json.JSONDecodeError) as exc: raise AdoptionRefused(f"invalid adoption manifest: {exc}") from exc
    return validate_manifest(value,source_root)

def validate_manifest(value: Any,source_root: Path=ROOT,*,_capability: object|None=None) -> dict[str,Any]:
    if not isinstance(value,dict) or set(value)!={"schema","artifacts"} or value.get("schema")!=1 or not isinstance(value.get("artifacts"),list) or not value["artifacts"]:
        raise AdoptionRefused("adoption manifest must contain schema 1 and a nonempty artifacts array")
    if _contains_executable_data(value): raise AdoptionRefused("adoption manifest is data only and cannot supply shell commands or interpolation")
    if os.path.lexists(source_root/"harness/project.json"):
        validate_batch_packaging(source_root)
    generated=_capability is _GENERATED_CAPABILITY; allowset=None if generated else git_visible_paths(source_root); seen=set()
    for index,item in enumerate(value["artifacts"],1):
        if not isinstance(item,dict): raise AdoptionRefused(f"adoption artifact {index} must be an object")
        allowed=ENTRY_KEYS if item.get("collision_policy")=="side_by_side" else ENTRY_KEYS-{"side_by_side_name"}
        if set(item)!=allowed: raise AdoptionRefused(f"adoption artifact {index} has unknown or missing fields")
        path_value=item.get("path")
        if not safe_path(path_value) or path_value in seen: raise AdoptionRefused(f"adoption artifact {index} has an unsafe or duplicate path")
        seen.add(path_value)
        if item.get("role") not in ROLES or item.get("collision_policy") not in POLICIES or not isinstance(item.get("required"),bool): raise AdoptionRefused(f"adoption artifact {path_value} has invalid policy data")
        side=item.get("side_by_side_name")
        if item["collision_policy"]=="side_by_side" and (not safe_path(side) or "/" in side): raise AdoptionRefused(f"adoption artifact {path_value} has an unsafe side-by-side name")
        source=source_root/path_value
        if not source_path_allowed(source_root,path_value,allowset,trusted_generated=generated): raise AdoptionRefused("adoption source path is excluded by ignore rules")
        if source.is_symlink() or not source.is_file(): raise AdoptionRefused(f"adoption source is not a regular file: {path_value}")
    return value

def target_root(value: str|Path) -> Path:
    requested=Path(value).expanduser().resolve()
    if not requested.is_dir() or requested.is_symlink(): raise AdoptionRefused("target must be an existing version-control repository root")
    result=subprocess.run(["git","rev-parse","--show-toplevel"],cwd=requested,text=True,capture_output=True)
    if result.returncode or Path(result.stdout.strip()).resolve()!=requested:
        raise AdoptionRefused("target must be the version-control repository root; rerun with --target set to that root")
    return requested

def _safe_target(root: Path,relative: str) -> Path:
    if not safe_path(relative): raise AdoptionRefused(f"unsafe adoption path: {relative}")
    current=root
    for part in PurePosixPath(relative).parts[:-1]:
        current=current/part
        if current.exists() and (current.is_symlink() or not current.is_dir()): raise AdoptionRefused(f"target path traverses a symlink or non-directory: {relative}")
    target=root/relative
    if target.is_symlink() or (target.exists() and not target.is_file()): raise AdoptionRefused(f"target path is not a regular file: {relative}")
    return target

def _classify(source: Path,target: Path) -> tuple[str,str|None]:
    if not target.exists(): return "absent",None
    target_digest=digest(target)
    return ("identical" if target_digest==digest(source) else "colliding"),target_digest

def source_commit(root: Path=ROOT) -> str:
    result=subprocess.run(["git","rev-parse","HEAD"],cwd=root,text=True,capture_output=True)
    value=result.stdout.strip()
    return value if result.returncode==0 and re.fullmatch(r"[0-9a-f]{40}",value) else "uncommitted"

def _installed_manifest_errors(root: Path, provenance_root: Path=ROOT, *, current_source_root: Path|None=None, target_provenance: dict[str,bytes]|None=None) -> list[str]:
    """Validate the predecessor installation marker before granting migration."""
    path=root/"harness/adoption-manifest.json"
    try:
        metadata=os.lstat(path)
        if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode) or metadata.st_size>MAX_PRIVATE_EXCLUDE_BYTES:
            return ["installed harness manifest is invalid"]
        value=json.loads(target_provenance["harness/adoption-manifest.json"].decode("utf-8") if target_provenance is not None else path.read_text(encoding="utf-8"))
    except (OSError,UnicodeError,json.JSONDecodeError):
        return ["installed harness manifest is invalid"]
    if not isinstance(value,dict) or set(value)!={"schema","artifacts"} or value.get("schema")!=1 or not isinstance(value.get("artifacts"),list) or not value["artifacts"]:
        return ["installed harness manifest is invalid"]
    seen=set()
    for item in value["artifacts"]:
        allowed=ENTRY_KEYS if isinstance(item,dict) and item.get("collision_policy")=="side_by_side" else ENTRY_KEYS-{"side_by_side_name"}
        if not isinstance(item,dict) or set(item)!=allowed or not safe_path(item.get("path")) or item["path"] in seen or item.get("role") not in ROLES or item.get("collision_policy") not in POLICIES or type(item.get("required")) is not bool:
            return ["installed harness manifest is invalid"]
        seen.add(item["path"])
    if not {"harness/project.json","script/adopt.py"} <= seen:
        return ["installed harness manifest is invalid"]
    predecessor_paths=PROVENANCE_ARTIFACTS
    target_bytes={}
    for relative in predecessor_paths:
        candidate=root/relative
        try:
            metadata=os.lstat(candidate)
            if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode) or metadata.st_size>MAX_PRIVATE_EXCLUDE_BYTES:
                return ["installed harness predecessor evidence is not authenticated/versioned"]
            target_bytes[relative]=target_provenance[relative] if target_provenance is not None else _planned_source_bytes(root,relative,None,_snapshot=True)[0]
        except OSError:
            return ["installed harness predecessor evidence is not authenticated/versioned"]
    try:
        target_version=json.loads(target_bytes["harness/version.json"].decode("utf-8"))
    except (UnicodeError,json.JSONDecodeError):
        return ["installed harness predecessor evidence is not authenticated/versioned"]
    if not isinstance(target_version,dict) or target_version.get("schema")!=1 or not isinstance(target_version.get("version"),str) or not isinstance(target_version.get("previous_version"),str):
        return ["installed harness predecessor evidence is not authenticated/versioned"]
    # A source tuple can be the validated current candidate before its next
    # template commit.  Authenticate the entire tuple together, rather than
    # treating current bytes as an unauthenticated predecessor or accepting an
    # individual matching marker.
    current_bytes={}
    for relative in predecessor_paths:
        candidate=(current_source_root or provenance_root)/relative
        try:
            before=os.lstat(candidate)
            if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode) or before.st_size>MAX_PRIVATE_EXCLUDE_BYTES:
                current_bytes={}; break
            payload=candidate.read_bytes()
            after=os.lstat(candidate)
            identity=lambda metadata:(metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns)
            if identity(before)!=identity(after) or len(payload)!=before.st_size:
                current_bytes={}; break
            current_bytes[relative]=payload
        except OSError:
            current_bytes={}; break
    if len(current_bytes)==len(predecessor_paths) and all(current_bytes[path]==target_bytes[path] for path in predecessor_paths):
        try:
            current_project=json.loads(((current_source_root or provenance_root)/"harness/project.json").read_text(encoding="utf-8"))
            current_version=json.loads(current_bytes["harness/version.json"].decode("utf-8"))
        except (OSError,UnicodeError,json.JSONDecodeError):
            current_project=None; current_version=None
        if current_version==target_version and not _project_contract_errors(current_project,require_release_authority=isinstance(current_project,dict) and "release_authority" in current_project):
            return []
    history=subprocess.run(["git","rev-list","HEAD","--",*predecessor_paths],cwd=provenance_root,text=True,capture_output=True)
    if history.returncode:
        return ["installed harness predecessor evidence is not authenticated/versioned"]
    for commit in history.stdout.splitlines():
        expected={}
        for relative in predecessor_paths:
            result=subprocess.run(["git","show",f"{commit}:{relative}"],cwd=provenance_root,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
            if result.returncode:
                expected={}; break
            expected[relative]=result.stdout
        if not expected or any(expected[path]!=target_bytes[path] for path in predecessor_paths):
            continue
        try:
            project_result=subprocess.run(["git","show",f"{commit}:harness/project.json"],cwd=provenance_root,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
            predecessor_project=json.loads(project_result.stdout.decode("utf-8"))
            predecessor_version=json.loads(expected["harness/version.json"].decode("utf-8"))
        except (UnicodeError,json.JSONDecodeError):
            continue
        if predecessor_version!=target_version or _project_contract_errors(predecessor_project,require_release_authority="release_authority" in predecessor_project):
            continue
        return []
    return ["installed harness predecessor evidence is not authenticated/versioned"]

def _project_contract_errors(value: Any, *, require_release_authority: bool) -> list[str]:
    return canonical_harness.project_contract_errors(value,require_release_authority=require_release_authority)

def _migrated_project(existing: Any, source_project: Any) -> dict[str,Any]:
    if not isinstance(existing,dict) or not isinstance(source_project,dict):
        raise AdoptionRefused("existing harness/project.json cannot receive the release authority migration")
    current_release=source_project.get("release_authority")
    if "release_authority" in existing and _project_contract_errors(existing,require_release_authority=True):
        raise AdoptionRefused("existing harness/project.json cannot receive the release authority migration")
    predecessor={key:value for key,value in existing.items() if key!="release_authority"}
    if _project_contract_errors(predecessor,require_release_authority=False) or _project_contract_errors(source_project,require_release_authority=True):
        raise AdoptionRefused("existing harness/project.json cannot receive the release authority migration")
    migrated=dict(predecessor)
    migrated["external_gates"]=[gate for gate in predecessor["external_gates"] if gate!="release-approval"]
    migrated["release_authority"]=current_release
    if "installation" in source_project:
        migrated["installation"]=source_project["installation"]
    if _project_contract_errors(migrated,require_release_authority=True):
        raise AdoptionRefused("prospective harness/project.json release authority migration is invalid")
    return migrated

def _release_authority_runtime_artifact(relative: str) -> bool:
    """Identify installed execution contracts coupled to the release policy schema."""
    if relative in {"script/harness.py","script/adopt.py","script/batch.py","script/batch_schema.py","bin/agent-session","bin/agent-adopt"}:
        return True
    if not relative.startswith("harness/"):
        return False
    return relative not in {"harness/project.json","harness/adoption-manifest.json","harness/version.json","harness/outcomes.json","harness/measurements.json"}


def _release_authority_migration_errors(entries: list[dict[str,Any]]) -> list[str]:
    """Do not publish a newer project contract beside a skipped predecessor runtime."""
    if not any(entry.get("path")=="harness/project.json" and entry.get("classification")=="colliding" and entry.get("resolution") in {"merge_release_authority","overwrite"} for entry in entries):
        return []
    stale=next((entry for entry in entries if entry.get("classification")=="colliding" and entry.get("resolution")=="skip" and _release_authority_runtime_artifact(entry.get("path",""))),None)
    for path in PROVENANCE_ARTIFACTS:
        entry=next((candidate for candidate in entries if candidate.get("path")==path),None)
        if not isinstance(entry,dict) or entry.get("classification") not in {"identical","colliding"}:
            return ["release authority migration requires the complete provenance tuple"]
        if entry.get("classification")=="colliding" and (entry.get("resolution")!="refresh_provenance" or entry.get("authorized") is not True):
            return [f"release authority migration requires the complete provenance tuple with exact --authorize {path}"]

    if stale is None:
        return []
    return [f"release authority migration requires a compatible runtime update: {stale['path']}"]


def adoption_plan(target: str|Path,authorized: set[str]|None=None,manifest: dict[str,Any]|None=None,source_root: Path=ROOT,*,provenance_root: Path|None=None,_capability: object|None=None) -> dict[str,Any]:
    root=target_root(target); reject_installed_batch_artifacts(root); authorizations=authorized or set(); document=validate_manifest(manifest,source_root,_capability=_capability) if manifest is not None else load_manifest(source_root=source_root); entries=[]
    source_distribution=_distribution(source_root,missing_ok=True) or "shared"
    target_distribution=_installed_distribution(root,missing_ok=True)
    if target_distribution is not None and target_distribution!=source_distribution:
        raise AdoptionRefused(f"installed harness distribution is {target_distribution}; refusing to switch to {source_distribution}")
    installed_markers=os.path.lexists(root/"harness/adoption-manifest.json") and os.path.lexists(root/"script/adopt.py")
    provenance_reads={}
    if installed_markers:
        try:
            provenance_reads={relative:_planned_source_bytes(root,relative,None,_snapshot=True) for relative in PROVENANCE_ARTIFACTS}
        except AdoptionRefused:
            provenance_reads={}
    installed_errors=(_installed_manifest_errors(root,provenance_root or source_root,current_source_root=source_root,target_provenance={relative:value[0] for relative,value in provenance_reads.items()}) if provenance_reads else ["installed harness predecessor evidence is not authenticated/versioned"]) if installed_markers else []
    integrated_update=installed_markers and not installed_errors
    declared={item["path"] for item in document["artifacts"]}
    alternates={str(PurePosixPath(item["path"]).parent/item["side_by_side_name"]) for item in document["artifacts"] if item["collision_policy"]=="side_by_side"}
    unknown=sorted(authorizations-declared-alternates)
    if unknown: raise AdoptionRefused(f"--authorize must name one exact declared path; unknown: {unknown[0]}")
    for item in sorted(document["artifacts"],key=lambda candidate:candidate["path"]):
        relative=item["path"]; source=source_root/relative; target_path=_safe_target(root,relative)
        target_snapshot=_target_snapshot(root,relative) if os.path.lexists(target_path) else None
        target_digest=target_snapshot[2] if target_snapshot else None
        source_digest=digest(source)
        classification="absent" if target_snapshot is None else "identical" if target_digest==source_digest else "colliding"
        if relative in provenance_reads and target_snapshot!=provenance_reads[relative][2]:
            raise AdoptionRefused("adoption provenance changed during authentication")
        authorized_entry=relative in authorizations
        if classification=="absent": resolution="write"
        elif classification=="identical": resolution="skip"
        elif authorized_entry: resolution="overwrite"
        # HARNESS-012 adds a required host-owned release policy.  Preserve all
        # existing project settings while atomically adding only that contract
        # during an in-place harness upgrade.
        elif relative=="harness/project.json" and integrated_update:
            try:
                owner_project=json.loads(target_path.read_text(encoding="utf-8")); source_project=json.loads(source.read_text(encoding="utf-8"))
            except (OSError,UnicodeError,json.JSONDecodeError) as exc:
                raise AdoptionRefused("existing harness/project.json cannot receive the release authority migration") from exc
            migrated=_migrated_project(owner_project,source_project)
            resolution="skip" if owner_project==migrated else "merge_release_authority"
        elif relative=="harness/project.json" and installed_markers and installed_errors:
            raise AdoptionRefused(installed_errors[0]+"; rerun with --authorize harness/project.json")
        elif relative==".agent-harness/state-domain.json" and installed_markers and source_distribution=="shared":
            previous=_planned_source_bytes(root,relative,target_digest)[0]
            if previous!=LEGACY_STATE_DOMAIN_BOOTSTRAP and not _recognized_previous_state_domain(previous):
                raise AdoptionRefused("shared runtime upgrade requires an exact recognized local state-domain marker or --authorize .agent-harness/state-domain.json")
            resolution="migrate_state_domain"
        elif relative==".agent-harness/state-domain.json" and source_distribution=="shared":
            raise AdoptionRefused("shared installation found an existing local state-domain marker; use exact --authorize .agent-harness/state-domain.json to replace it")
        elif item["collision_policy"]=="side_by_side" and integrated_update: resolution="skip"
        elif item["collision_policy"]=="side_by_side": resolution="side_by_side"
        else: resolution="skip"
        entries.append({"path":relative,"classification":classification,"resolution":resolution,"authorized":authorized_entry,"source_digest":source_digest,"target_digest":target_digest,"target_snapshot":target_snapshot,"target_parent_snapshot":_existing_parent_snapshot(root,relative)})
    migration_active=any(entry.get("path")=="harness/project.json" and entry.get("classification")=="colliding" and entry.get("resolution") in {"merge_release_authority","overwrite"} for entry in entries)
    if migration_active:
        if not set(PROVENANCE_ARTIFACTS)<=declared:
            raise AdoptionRefused("release authority migration requires the complete provenance tuple")
        for entry in entries:
            if entry["path"] not in PROVENANCE_ARTIFACTS:
                continue
            if entry["classification"] not in {"identical","colliding"}:
                raise AdoptionRefused("release authority migration requires the complete provenance tuple")
            if entry["classification"]=="colliding":
                if not entry["authorized"]:
                    raise AdoptionRefused(f"release authority migration requires the complete provenance tuple with exact --authorize {entry['path']}")
                entry["resolution"]="refresh_provenance"

    migration_errors=_release_authority_migration_errors(entries)
    if migration_errors:
        raise AdoptionRefused(migration_errors[0])
    return {"target_root":str(root),"distribution":source_distribution,"harness_source_commit":source_commit(source_root),"entries":entries,"integrated_provenance":integrated_update,"migration_active":migration_active,"requires_authorization":any(entry["classification"]=="colliding" and entry["resolution"] in {"skip","side_by_side"} for entry in entries)}

def application_state_index_snapshot(root: Path) -> list[dict[str,str]]:
    """Capture indexed application-state entries and reject unsafe Git metadata."""
    staged=subprocess.run(["git","ls-files","--stage","-z"],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    flags=subprocess.run(["git","ls-files","-v","-z"],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if staged.returncode or flags.returncode: raise AdoptionRefused("application feature-state index could not be inspected safely")
    flag_map={}
    for record in flags.stdout.split(b"\0"):
        if not record: continue
        if len(record)<3 or record[1:2]!=b" ": raise AdoptionRefused("application feature-state index flags are malformed")
        flag_map[os.fsdecode(record[2:])]=record[:1].decode("ascii",errors="strict")
    result=[]
    for record in staged.stdout.split(b"\0"):
        if not record: continue
        try:
            metadata,path_bytes=record.split(b"\t",1)
            mode,oid,stage=metadata.decode("ascii").split(" ")
            path=os.fsdecode(path_bytes)
        except (ValueError,UnicodeError) as exc:
            raise AdoptionRefused("application feature-state index contains an invalid entry") from exc
        if not is_private_git_path(path): continue
        result.append({"path":path,"mode":mode,"oid":oid,"stage":stage,"flag":flag_map.get(path,"?")})
    return sorted(result,key=lambda item:item["path"])

def application_state_index_blockers(root: Path,entries: list[dict[str,str]]) -> list[str]:
    blockers=[]
    head=subprocess.run(["git","rev-parse","--verify","HEAD"],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    command=["git","diff","--cached","--no-renames","--name-only","-z"]
    if head.returncode==0: command.append("HEAD")
    staged=subprocess.run(command,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if staged.returncode!=0 or (staged.stdout and not staged.stdout.endswith(b"\0")):
        blockers.append("staged state cannot be inspected")
        staged_paths=[]
    else:
        staged_paths=[os.fsdecode(path) for path in staged.stdout.split(b"\0") if path]
    private_staged=[path for path in staged_paths if is_private_git_path(path)]
    if entries or private_staged:
        try: index_path=_git_index_path(root)
        except AdoptionRefused as exc: return [str(exc)]
        if os.path.lexists(index_path.with_name(index_path.name+".lock")):
            blockers.append("repository Git index is locked by another operation")
    blockers.extend(f"{path}: staged changes" for path in private_staged)
    for item in entries:
        path=item["path"]
        if item["stage"]!="0": blockers.append(f"{path}: unresolved index stages")
        if item["flag"]!="H": blockers.append(f"{path}: nonstandard index flags")
    return sorted(set(blockers))

def _git_index_path(root: Path) -> Path:
    raw=subprocess.run(["git","rev-parse","--path-format=absolute","--git-path","index"],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if raw.returncode: raise AdoptionRefused("repository Git index path could not be resolved safely")
    path=Path(os.fsdecode(raw.stdout.rstrip(b"\n")))
    if not path.is_absolute(): path=root/path
    return path

def _index_digest(path: Path) -> str:
    try:
        metadata=path.lstat()
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_nlink!=1 or metadata.st_size>128*1024*1024:
            raise AdoptionRefused("repository Git index is not a safe regular file")
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except FileNotFoundError:
        return "absent"
    except OSError as exc:
        raise AdoptionRefused("repository Git index could not be read safely") from exc


def _original_index_is_current(root: Path, expected_digest: str) -> bool:
    """Only a proven restored index permits exclusion rollback."""
    try: return _index_digest(_git_index_path(root))==expected_digest
    except AdoptionRefused: return False


class IndexPublicationUncertain(AdoptionRefused):
    """The index may have changed; keep private exclusions for recovery."""


def _sync_index_directory(path: Path) -> None:
    directory_fd=os.open(path.parent,os.O_RDONLY|getattr(os,"O_DIRECTORY",0))
    try: os.fsync(directory_fd)
    finally: os.close(directory_fd)

def _plan_application_state_untracking(root: Path,plan: dict[str,Any]) -> None:
    entries=application_state_index_snapshot(root)
    plan["application_state_tracked_paths"]=[item["path"] for item in entries]
    plan["application_state_index_snapshot"]=entries
    plan["application_state_index_blockers"]=application_state_index_blockers(root,entries)
    plan["application_state_index_digest"]=_index_digest(_git_index_path(root))

def _state_untracking_marker(root: Path,head: str,source_digest: str,result_digest: str) -> Path:
    name=f"harness-state-untracking-{head}-{result_digest}-{source_digest}.json"
    return _git_index_path(root).with_name(name)

def _head_commit(root: Path) -> str:
    result=subprocess.run(["git","rev-parse","--verify","HEAD"],cwd=root,text=True,capture_output=True)
    if result.returncode:
        unborn=subprocess.run(["git","rev-parse","--is-inside-work-tree"],cwd=root,text=True,capture_output=True)
        if unborn.returncode==0 and unborn.stdout.strip()=="true":
            return "unborn"
    if result.returncode or not re.fullmatch(r"[0-9a-f]{40,64}",result.stdout.strip()):
        raise AdoptionRefused("application feature-state HEAD could not be authenticated")
    return result.stdout.strip()

def _record_state_untracking(root: Path,source_digest: str,result_digest: str,entries: list[dict[str,str]]) -> None:
    """Retain exact local proof of the index transition for a repeat install."""
    head=_head_commit(root)
    marker=_state_untracking_marker(root,head,source_digest,result_digest)
    paths=sorted(item["path"] for item in entries)
    digest=lambda value: hashlib.sha256(json.dumps(value,sort_keys=True,separators=(",",":")).encode()).hexdigest()
    payload=(json.dumps({"schema":1,"head":head,"source_index_digest":source_digest,
                         "result_index_digest":result_digest,"removed_entries_digest":digest(entries),
                         "removed_paths_digest":digest(paths),"removed_count":len(paths)},sort_keys=True)+"\n").encode()
    try:
        descriptor=os.open(marker,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_NOFOLLOW",0),0o600)
    except FileExistsError:
        if marker.is_symlink() or marker.read_bytes()!=payload:
            raise AdoptionRefused("prior private-state untracking proof conflicts with this index transition")
        return
    try:
        with os.fdopen(descriptor,"wb") as handle:
            handle.write(payload); handle.flush(); os.fsync(handle.fileno())
        _sync_index_directory(marker)
    except BaseException:
        marker.unlink(missing_ok=True)
        raise

def _has_exact_state_untracking_proof(plan: dict[str,Any]) -> bool:
    root=Path(plan["target_root"])
    digest=plan["application_state_index_digest"]
    head=_head_commit(root)
    blocked=sorted(blocker.removesuffix(": staged changes") for blocker in plan["application_state_index_blockers"])
    if len(blocked)!=len(set(blocked)) or not all(is_private_git_path(path) for path in blocked):
        return False
    paths_digest=hashlib.sha256(json.dumps(blocked,sort_keys=True,separators=(",",":")).encode()).hexdigest()
    index_dir=_git_index_path(root).parent
    candidates=index_dir.glob(f"harness-state-untracking-{head}-{digest}-*.json")
    for marker in candidates:
        try:
            source_digest=marker.name.removeprefix(f"harness-state-untracking-{head}-{digest}-").removesuffix(".json")
            if re.fullmatch(r"[0-9a-f]{64}",source_digest) is None:
                continue
            metadata=marker.lstat()
            if not stat.S_ISREG(metadata.st_mode) or metadata.st_size>4096 or metadata.st_nlink!=1:
                continue
            proof=json.loads(marker.read_text(encoding="utf-8"))
            if (proof["schema"]==1 and proof["head"]==head
                    and proof["result_index_digest"]==digest
                    and proof["source_index_digest"]==source_digest
                    and re.fullmatch(r"[0-9a-f]{64}",proof["removed_entries_digest"]) is not None
                    and proof["removed_paths_digest"]==paths_digest
                    and proof["removed_count"]==len(blocked)):
                return True
        except (OSError,UnicodeError,ValueError,KeyError,TypeError):
            continue
    return False


def _state_index_blockers_require_stop(plan: dict[str,Any]) -> bool:
    blockers=plan["application_state_index_blockers"]
    if not blockers: return False
    # Installation provenance alone does not prove who staged these deletions.
    # Only the exact earlier index transition permits a repeat operation.
    completed=plan.get("integrated_provenance") is True or plan.get("no_op") is True or plan.get("exclusion_only") is True
    return not (completed and not plan["application_state_index_snapshot"]
                and all(blocker.endswith(": staged changes") for blocker in blockers)
                and _has_exact_state_untracking_proof(plan))

def _reserve_application_state_index(root: Path,expected: list[dict[str,str]],expected_index_digest: str) -> dict[str,Any]|None:
    """Reserve the Git index before publishing runtime or exclusion changes."""
    if not expected: return None
    index_path=_git_index_path(root); lock_path=index_path.with_name(index_path.name+".lock")
    try: lock_fd=os.open(lock_path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_NOFOLLOW",0),0o600)
    except FileExistsError as exc: raise AdoptionRefused("repository Git index is locked by another operation") from exc
    try:
        current=application_state_index_snapshot(root)
        if current!=expected: raise AdoptionRefused("application feature-state index changed after planning")
        blockers=[item for item in application_state_index_blockers(root,current) if item!="repository Git index is locked by another operation"]
        if blockers: raise AdoptionRefused("cannot safely untrack application feature state: "+blockers[0])
        if _index_digest(index_path)!=expected_index_digest: raise AdoptionRefused("repository Git index changed after planning")
        metadata=os.fstat(lock_fd)
        return {"fd":lock_fd,"path":lock_path,"identity":(metadata.st_dev,metadata.st_ino),"index":index_path,"digest":expected_index_digest}
    except BaseException:
        os.close(lock_fd)
        try: lock_path.unlink()
        except FileNotFoundError: pass
        raise

def _release_application_state_index(reservation: dict[str,Any]|None) -> None:
    if reservation is None: return
    descriptor=reservation["fd"]; path=reservation["path"]
    try:
        try: metadata=path.lstat()
        except FileNotFoundError: metadata=None
        if metadata is not None and (metadata.st_dev,metadata.st_ino)==reservation["identity"]: path.unlink()
    finally: os.close(descriptor)

def _untrack_application_state(root: Path,expected: list[dict[str,str]],expected_index_digest: str,reservation: dict[str,Any]|None=None) -> list[str]:
    current=application_state_index_snapshot(root)
    if current!=expected: raise AdoptionRefused("application feature-state index changed after planning")
    if not current: return []
    blockers=application_state_index_blockers(root,current)
    if reservation is not None: blockers=[item for item in blockers if item!="repository Git index is locked by another operation"]
    if blockers: raise AdoptionRefused("cannot safely untrack application feature state: "+blockers[0])
    index_path=_git_index_path(root); lock_path=index_path.with_name(index_path.name+".lock")
    lock_fd=None; temporary=None; preimage=None; owns_lock=reservation is None
    published_digest=None; published=False; publication_intent=False; keep_preimage=False
    staged_lock_identity=None; owned_lock_identity=None; original_index_identity=None
    try:
        if reservation is None:
            try: lock_fd=os.open(lock_path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_NOFOLLOW",0),0o600)
            except FileExistsError as exc: raise AdoptionRefused("repository Git index is locked by another operation") from exc
        else:
            lock_fd=reservation["fd"]
            metadata=os.stat(lock_path,follow_symlinks=False)
            if (metadata.st_dev,metadata.st_ino)!=reservation["identity"]: raise AdoptionRefused("repository Git index reservation changed during installation")
        if owns_lock:
            metadata=os.fstat(lock_fd); owned_lock_identity=(metadata.st_dev,metadata.st_ino)
        if _index_digest(index_path)!=expected_index_digest: raise AdoptionRefused("repository Git index changed after planning")
        if expected_index_digest=="absent": raise AdoptionRefused("repository Git index changed after planning")
        original_metadata=os.stat(index_path,follow_symlinks=False)
        original_index_identity=(original_metadata.st_dev,original_metadata.st_ino)
        preimage=index_path.with_name(f".index-adoption-original-{secrets.token_hex(16)}")
        shutil.copyfile(index_path,preimage)
        os.chmod(preimage,0o600)
        with preimage.open("rb") as handle: os.fsync(handle.fileno())
        temporary=index_path.with_name(f".index-adoption-{secrets.token_hex(16)}")
        shutil.copyfile(index_path,temporary)
        environment=os.environ.copy(); environment["GIT_INDEX_FILE"]=str(temporary)
        for item in current:
            result=subprocess.run(["git","update-index","--force-remove","--",item["path"]],cwd=root,env=environment,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
            if result.returncode: raise AdoptionRefused("could not untrack private state path: "+item["path"])
        with temporary.open("rb") as handle: os.fsync(handle.fileno())
        staged_metadata=os.stat(temporary,follow_symlinks=False)
        staged_lock_identity=(staged_metadata.st_dev,staged_metadata.st_ino)
        os.replace(temporary,lock_path); temporary=None
        published_digest=_index_digest(lock_path)
        publication_intent=True
        os.replace(lock_path,index_path)
        published=True
        if owns_lock: os.close(lock_fd); lock_fd=None
        _sync_index_directory(index_path)
        _record_state_untracking(root,expected_index_digest,published_digest,current)
        return [item["path"] for item in current]
    except BaseException as exc:
        if publication_intent and published_digest is not None and preimage is not None:
            try:
                visible=os.stat(index_path,follow_symlinks=False)
                visible_identity=(visible.st_dev,visible.st_ino)
                visible_digest=_index_digest(index_path)
            except BaseException as inspect_error:
                keep_preimage=True
                raise IndexPublicationUncertain("private-state index publication needs recovery; private exclusions retained") from inspect_error
            if visible_identity==original_index_identity and visible_digest==expected_index_digest:
                pass  # The rename did not publish; the original index is intact.
            elif visible_identity!=staged_lock_identity or visible_digest!=published_digest:
                keep_preimage=True
                raise IndexPublicationUncertain("private-state index publication needs recovery; private exclusions retained") from exc
            else:
                recovery_fd=None; recovery_identity=None
                try:
                    recovery_fd=os.open(lock_path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_NOFOLLOW",0),0o600)
                    recovery_metadata=os.fstat(recovery_fd)
                    recovery_identity=(recovery_metadata.st_dev,recovery_metadata.st_ino)
                    if _index_digest(index_path)!=published_digest or _index_digest(preimage)!=expected_index_digest:
                        raise AdoptionRefused("repository Git index changed after publication")
                    os.replace(preimage,index_path); preimage=None
                    _sync_index_directory(index_path)
                except BaseException as recovery_error:
                    keep_preimage=True
                    raise IndexPublicationUncertain("private-state index publication needs recovery; private exclusions retained") from recovery_error
                finally:
                    if recovery_fd is not None:
                        try: os.close(recovery_fd)
                        except BaseException: pass
                        try:
                            visible=os.stat(lock_path,follow_symlinks=False)
                            if (visible.st_dev,visible.st_ino)==recovery_identity: lock_path.unlink()
                        except BaseException: pass
        if isinstance(exc,OSError):
            raise AdoptionRefused("could not publish atomic private-state index update") from exc
        raise
    finally:
        if temporary is not None:
            try: temporary.unlink()
            except BaseException: pass
        if preimage is not None and not keep_preimage:
            try: preimage.unlink()
            except BaseException: pass
        if not published and staged_lock_identity is not None:
            try:
                visible=os.stat(lock_path,follow_symlinks=False)
                if (visible.st_dev,visible.st_ino)==staged_lock_identity: lock_path.unlink()
            except BaseException: pass
        if lock_fd is not None and owns_lock:
            try: os.close(lock_fd)
            except BaseException: pass
            try:
                visible=os.stat(lock_path,follow_symlinks=False)
                if (visible.st_dev,visible.st_ino)==owned_lock_identity: lock_path.unlink()
            except BaseException: pass

def _distribution(root: Path, *, missing_ok: bool=False) -> str|None:
    path=root/"harness/distribution.json"
    if not os.path.lexists(path):
        if missing_ok: return None
        return None
    try:
        payload=_planned_source_bytes(root,"harness/distribution.json",None,_snapshot=True)[0]
        value=json.loads(payload.decode("utf-8"))
        if not isinstance(value,dict) or type(value.get("schema")) is not int:
            raise ValueError("invalid distribution marker")
        distribution=value.get("distribution")
        if value.get("schema")!=1 or not isinstance(distribution,str) or distribution not in DISTRIBUTIONS: raise ValueError("invalid distribution")
        return distribution
    except (OSError,UnicodeError,json.JSONDecodeError,AttributeError,ValueError) as exc:
        raise AdoptionRefused("harness distribution marker is invalid") from exc

def _installed_distribution(root: Path, exclude_bytes: bytes | None=None, *, missing_ok: bool=False) -> str|None:
    """Read the installed marker, preferring private-layout runtime state."""
    private_marker=root/".agent-harness/harness/distribution.json"
    public_marker=root/"harness/distribution.json"
    private=_distribution(root/".agent-harness") if os.path.lexists(private_marker) else None
    public=_distribution(root) if os.path.lexists(public_marker) else None
    if private is not None and public is not None and private!=public:
        raise AdoptionRefused("installed harness distribution markers conflict")
    if exclude_bytes is None:
        exclude_bytes=private_exclude_state(private_exclude_path(root))[0]
    rules=set(_private_exclusion_block_rules(exclude_bytes))
    if private is None and public is None and not rules:
        return None if missing_ok else "shared"
    state_rules={"/.agent-harness/",*private_git_exclusion_rules()}
    legacy="personal" if rules-state_rules else "shared"
    marker=private or public
    if marker is not None and marker!=legacy:
        raise AdoptionRefused("installed harness distribution marker conflicts with repository-local exclusions")
    return marker or legacy

def _validate_existing_harness_bootstrap(root: Path) -> None:
    """Reject malformed private state before an upgrade preserves it."""
    for relative in HARNESS_BOOTSTRAP:
        path=root/relative
        if not os.path.lexists(path): continue
        if relative.endswith(".md"):
            try: _planned_source_bytes(root,relative,None,_snapshot=True)[0].decode("utf-8")
            except (UnicodeError,AdoptionRefused) as exc: raise AdoptionRefused(f"installed harness state is invalid: {relative}") from exc
            continue
        try:
            payload=_planned_source_bytes(root,relative,None,_snapshot=True)[0]
            document=json.loads(payload.decode("utf-8"),object_pairs_hook=canonical_harness._reject_duplicate_json_keys)
        except (UnicodeError,json.JSONDecodeError,ValueError,AdoptionRefused) as exc:
            raise AdoptionRefused(f"installed harness state is invalid: {relative}") from exc
        if relative.endswith("state-domain.json"):
            errors=canonical_harness.state_domain_errors(document)
            if errors and payload==LEGACY_STATE_DOMAIN_BOOTSTRAP:
                # Upgrade the exact prior generated marker below; arbitrary
                # malformed or contradictory owner state still refuses.
                continue
        else:
            errors=[]
            if not isinstance(document,dict) or type(document.get("schema")) is not int or document.get("schema") not in {1,2} or not isinstance(document.get("features"),list):
                errors.append("feature ledger schema is invalid")
            elif document["schema"]==2 and document.get("request") is not None and not canonical_harness.valid_request_reference(document.get("request")):
                errors.append("feature ledger request reference is invalid")
            elif any(not isinstance(feature,dict) or not isinstance(feature.get("id"),str) or not feature.get("id") for feature in document["features"]):
                errors.append("feature ledger entries are invalid")
            elif len({feature["id"] for feature in document["features"]})!=len(document["features"]):
                errors.append("feature ledger identifiers are duplicated")
        if errors: raise AdoptionRefused(f"installed harness state is invalid: {relative}")

def _leaf_identity(metadata: os.stat_result) -> tuple:
    return metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns,metadata.st_ctime_ns


def _rename_noreplace(source: Path,destination: Path,*,source_directory: int|None=None,destination_directory: int|None=None,source_identity: tuple|None=None,source_descriptor: int|None=None) -> None:
    libc=ctypes.CDLL(None,use_errno=True)
    source_b=os.fsencode(source.name if source_directory is not None else source)
    destination_b=os.fsencode(destination.name if destination_directory is not None else destination)
    cwd=-2 if sys.platform=="darwin" else -100
    source_fd=cwd if source_directory is None else source_directory
    destination_fd=cwd if destination_directory is None else destination_directory
    if source_identity is not None:
        visible=os.stat(source.name if source_directory is not None else source,dir_fd=source_directory,follow_symlinks=False)
        if _leaf_identity(visible)!=source_identity or (source_descriptor is not None and _leaf_identity(os.fstat(source_descriptor))!=source_identity):
            raise AdoptionRefused("adoption source leaf changed immediately before move")
    if sys.platform=="darwin" and hasattr(libc,"renameatx_np"):
        result=libc.renameatx_np(source_fd,source_b,destination_fd,destination_b,0x4)
    elif hasattr(libc,"renameat2"):
        result=libc.renameat2(source_fd,source_b,destination_fd,destination_b,0x1)
    else: raise OSError("atomic no-replace publication is unavailable")
    if result: code=ctypes.get_errno(); raise OSError(code,os.strerror(code),str(destination))

def _directory_identity(metadata: os.stat_result) -> tuple[int,int,int]:
    return metadata.st_dev,metadata.st_ino,metadata.st_mode


def _created_parent_matches(created: list[dict[str,Any]],parent: int,name: str,child: int) -> bool:
    parent_identity=_directory_identity(os.fstat(parent)); child_identity=_directory_identity(os.fstat(child))
    return any(record["name"]==name and record["parent_identity"]==parent_identity and record["identity"]==child_identity for record in created)


def _create_attached_directory(parent: int,name: str,creation_directory: int,created: list[dict[str,Any]]) -> int:
    """Create one target parent from private staging and journal it before move."""
    temporary="parent-"+secrets.token_hex(16)
    os.mkdir(temporary,0o700,dir_fd=creation_directory)
    child=os.open(temporary,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=creation_directory)
    full_identity=_leaf_identity(os.fstat(child))
    record={"parent":os.dup(parent),"parent_identity":_directory_identity(os.fstat(parent)),"child":os.dup(child),"identity":_directory_identity(os.fstat(child)),"name":name,"temporary":temporary}
    created.append(record)
    try:
        _rename_noreplace(Path(temporary),Path(name),source_directory=creation_directory,destination_directory=parent,source_identity=full_identity,source_descriptor=child)
        if _directory_identity(os.stat(name,dir_fd=parent,follow_symlinks=False))!=record["identity"]:
            raise AdoptionRefused("adoption created parent changed during attachment")
        return child
    except BaseException:
        try: os.close(child)
        except BaseException: pass
        raise


@contextmanager
def _attached_parent(root: Path,relative: str,expected: tuple|None=None,*,create_missing: bool=False,created: list[dict[str,Any]]|None=None,creation_directory: int|None=None):
    """Retain no-follow parent descriptors, creating only identity-bound parents."""
    descriptors=[]; attachments=[]; identities=[]
    created_records=created if created is not None else []
    try:
        if not safe_path(relative): raise AdoptionRefused("adoption publication path is unsafe")
        try: directory=os.open(root,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
        except OSError as exc: raise AdoptionRefused("adoption publication root changed") from exc
        descriptors.append(directory); identities.append(_directory_identity(os.fstat(directory)))
        if expected is not None and (not expected or identities[0]!=expected[0]):
            raise AdoptionRefused("adoption publication root changed")
        for index,part in enumerate(PurePosixPath(relative).parts[:-1],1):
            try:
                child=os.open(part,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=directory)
            except FileNotFoundError:
                if index < len(expected or ()) or not create_missing or creation_directory is None:
                    raise AdoptionRefused("adoption publication parent changed after planning")
                child=_create_attached_directory(directory,part,creation_directory,created_records)
            except OSError as exc:
                raise AdoptionRefused("adoption publication parent changed after planning") from exc
            descriptors.append(child); child_identity=_directory_identity(os.fstat(child))
            if expected is not None:
                if index < len(expected):
                    if child_identity!=expected[index]: raise AdoptionRefused("adoption publication parent changed after planning")
                elif not _created_parent_matches(created_records,directory,part,child):
                    raise AdoptionRefused("adoption publication parent appeared after planning")
            identities.append(child_identity); attachments.append((directory,part,child)); directory=child
        if expected is not None and (len(identities)<len(expected) or tuple(identities[:len(expected)])!=expected):
            raise AdoptionRefused("adoption publication parent changed after planning")
        if _directory_identity(os.stat(root,follow_symlinks=False))!=identities[0]:
            raise AdoptionRefused("adoption publication root changed")
        for parent,name,child in attachments:
            if _directory_identity(os.stat(name,dir_fd=parent,follow_symlinks=False))!=_directory_identity(os.fstat(child)):
                raise AdoptionRefused("adoption publication parent changed after planning")
        yield directory,tuple(identities)
    finally:
        for descriptor in reversed(descriptors):
            try: os.close(descriptor)
            except BaseException: pass

def _move_attached(source_root: Path,relative: str,source_parents: tuple,destination_root: Path,destination_parents: tuple,expected_source: tuple) -> None:
    with _attached_parent(source_root,relative,source_parents) as (source_fd,_source), _attached_parent(destination_root,relative,destination_parents) as (destination_fd,_destination):
        name=PurePosixPath(relative).name
        descriptor=os.open(name,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=source_fd)
        try:
            identity=_leaf_identity(os.fstat(descriptor))
            if not stat.S_ISREG(identity[2]) or identity!=expected_source[1]:
                raise AdoptionRefused("adoption source leaf no longer matches its planned identity")
            _rename_noreplace(source_root/relative,destination_root/relative,source_directory=source_fd,destination_directory=destination_fd,source_identity=identity,source_descriptor=descriptor)
            moved=_leaf_identity(os.stat(name,dir_fd=destination_fd,follow_symlinks=False))
            if moved[:5]!=identity[:5]:
                # A last-instruction source substitution must not leave an
                # unexpected file or link occupying the publication target.
                # Preserve it back in the source namespace without replacement.
                recovered=source_root/relative
                try:
                    _rename_noreplace(destination_root/relative,recovered,source_directory=destination_fd,destination_directory=source_fd,source_identity=moved)
                except OSError as exc:
                    if exc.errno!=errno.EEXIST: raise
                    recovered=recovered.with_name(name+".recovered-"+secrets.token_hex(16))
                    _rename_noreplace(destination_root/relative,recovered,source_directory=destination_fd,destination_directory=source_fd,source_identity=moved)
                raise AdoptionRefused("adoption source leaf changed during move; replacement preserved")
        finally:
            os.close(descriptor)

def _attached_leaf_exists(root: Path,relative: str,parents: tuple) -> bool:
    with _attached_parent(root,relative,parents) as (directory,_identities):
        try: os.stat(PurePosixPath(relative).name,dir_fd=directory,follow_symlinks=False)
        except FileNotFoundError: return False
        return True


def _rollback_created_parents(created: list[dict[str,Any]],creation_directory: int) -> None:
    """Remove only exact invocation-owned directories through retained descriptors."""
    for record in reversed(created):
        try:
            if _directory_identity(os.fstat(record["parent"]))!=record["parent_identity"] or _directory_identity(os.fstat(record["child"]))!=record["identity"]:
                continue
            location=None; directory=None
            for candidate,parent in ((record["name"],record["parent"]),(record["temporary"],creation_directory)):
                try: visible=os.stat(candidate,dir_fd=parent,follow_symlinks=False)
                except (FileNotFoundError,NotADirectoryError): continue
                if _directory_identity(visible)==record["identity"]:
                    location=candidate; directory=parent; break
            if location is None or directory is None: continue
            if os.listdir(record["child"]): continue
            recovery="rollback-"+secrets.token_hex(16)
            visible_identity=_leaf_identity(os.stat(location,dir_fd=directory,follow_symlinks=False))
            descriptor_identity=_leaf_identity(os.fstat(record["child"]))
            if visible_identity!=descriptor_identity: continue
            if directory!=creation_directory:
                _rename_noreplace(Path(location),Path(recovery),source_directory=directory,destination_directory=creation_directory,source_identity=visible_identity,source_descriptor=record["child"])
                location=recovery
                if os.listdir(record["child"]):
                    current=_leaf_identity(os.stat(location,dir_fd=creation_directory,follow_symlinks=False))
                    try: _rename_noreplace(Path(location),Path(record["name"]),source_directory=creation_directory,destination_directory=record["parent"],source_identity=current,source_descriptor=record["child"])
                    except (OSError,AdoptionRefused): pass
                    continue
            recovered=os.stat(location,dir_fd=creation_directory,follow_symlinks=False)
            if _directory_identity(recovered)==record["identity"]:
                os.rmdir(location,dir_fd=creation_directory)
        except BaseException:
            continue


def _close_created_parents(created: list[dict[str,Any]]) -> None:
    for record in created:
        for key in ("child","parent"):
            try: os.close(record[key])
            except BaseException: pass


def _close_descriptor(descriptor: int) -> None:
    try: os.close(descriptor)
    except BaseException: pass


def _revalidate_skipped_provenance(root: Path, source_root: Path, plan: dict[str,Any], published: dict[str,tuple]|None=None) -> None:
    """Every tuple member participates, including already-published replacements."""
    if not (plan.get("integrated_provenance") or plan.get("migration_active")):
        return
    published=published or {}
    for entry in plan["entries"]:
        if entry["path"] in PROVENANCE_ARTIFACTS or (plan.get("migration_active") and entry["resolution"]=="skip" and _release_authority_runtime_artifact(entry["path"])):
            try:
                _planned_source_bytes(source_root,entry["path"],entry["source_digest"])
                _require_target_snapshot(root,entry["path"],published.get(entry["path"],entry["target_snapshot"]))
            except AdoptionRefused as exc:
                kind="skipped adoption provenance" if entry["path"] in PROVENANCE_ARTIFACTS and entry["resolution"]=="skip" else "adoption release runtime" if _release_authority_runtime_artifact(entry["path"]) else "adoption provenance"
                raise AdoptionRefused(f"{kind} changed after planning or publication") from exc

def apply_adoption(target: str|Path,authorized: set[str]|None=None,fail_after: int|None=None,manifest: dict[str,Any]|None=None,source_root: Path=ROOT,*,provenance_root: Path|None=None,_capability: object|None=None,_publication_guard: Callable[[Path,dict[str,Any]],None]|None=None) -> dict[str,Any]:
    authorizations=authorized or set(); manifest=validate_manifest(manifest,source_root,_capability=_capability) if manifest is not None else load_manifest(source_root=source_root); plan=adoption_plan(target,authorizations,manifest,source_root,provenance_root=provenance_root,_capability=_capability); root=Path(plan["target_root"]); by_path={item["path"]:item for item in manifest["artifacts"]}; writes=[]; reports=[]
    source_has_project=(source_root/"harness/project.json").exists()
    source_binding=validate_batch_packaging(source_root) if source_has_project else None
    def require_source_binding():
        if (source_root/"harness/project.json").exists()!=source_has_project or (source_has_project and validate_batch_packaging(source_root)!=source_binding):
            raise AdoptionRefused("certified adoption source changed before publication")
    for entry in plan["entries"]:
        item=by_path[entry["path"]]; destination=entry["path"]
        if entry["resolution"] in {"write","overwrite","merge_release_authority","migrate_state_domain","refresh_provenance"}: writes.append((entry["path"],destination,entry["resolution"]!="write")); continue
        if entry["resolution"]=="side_by_side":
            destination=str(PurePosixPath(entry["path"]).parent/item["side_by_side_name"])
            side=_safe_target(root,destination); classification,_=_classify(source_root/entry["path"],side)
            if classification=="absent": writes.append((entry["path"],destination,False))
            elif classification=="colliding":
                if destination not in authorizations: raise AdoptionRefused(f"unauthorized collision at {destination}; rerun with --authorize {destination}")
                writes.append((entry["path"],destination,True))
            reports.append({"path":entry["path"],"policy":"side_by_side","destination":destination})
        elif entry["classification"]=="colliding": reports.append({"path":entry["path"],"policy":item["collision_policy"],"action":"owner merge required" if item["collision_policy"]=="merge_required" else "left unchanged","required_source_digest":entry["source_digest"]})
    validate_manifest(manifest,source_root,_capability=_capability)
    planned={entry["path"]:entry for entry in plan["entries"]}; staging=Path(tempfile.mkdtemp(prefix=f".{root.name}.adopt-",dir=root.parent)); staged=staging/"new"; backups=staging/"original"; parent_pool=staging/"parents"; staged.mkdir(); backups.mkdir(); parent_pool.mkdir(); parent_pool_fd=os.open(parent_pool,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0)); created=[]; published=[]; displaced=[]
    targets={}; target_parent_snapshots={}; target_parents={}; staged_snapshots={}; published_snapshots={}
    try:
        for source_relative,destination_relative,overwrite in writes:
            expected=planned.get(source_relative)
            if expected is None: raise AdoptionRefused("adoption plan is missing a staged source")
            targets[destination_relative]=expected["target_snapshot"] if destination_relative==source_relative else (_target_snapshot(root,destination_relative) if overwrite else None)
            target_parent_snapshots[destination_relative]=expected["target_parent_snapshot"]
            payload,mode=_planned_source_bytes(source_root,source_relative,expected["source_digest"])
            if expected["resolution"]=="merge_release_authority":
                _require_target_snapshot(root,destination_relative,targets[destination_relative])
                try:
                    owner_payload,_owner_mode=_planned_source_bytes(root,destination_relative,expected["target_digest"])
                    existing=json.loads(owner_payload.decode("utf-8")); source_project=json.loads(payload.decode("utf-8"))
                except (OSError,UnicodeError,json.JSONDecodeError) as exc:
                    raise AdoptionRefused("existing harness/project.json cannot receive the release authority migration") from exc
                migrated=_migrated_project(existing,source_project)
                payload=(json.dumps(migrated,indent=2)+"\n").encode("utf-8")
            staged_path=staged/destination_relative; staged_path.parent.mkdir(parents=True,exist_ok=True); staged_path.write_bytes(payload); os.chmod(staged_path,mode)
            staged_snapshots[destination_relative]=_target_snapshot(staged,destination_relative)
        validate_manifest(manifest,source_root,_capability=_capability)
        if _publication_guard is not None: _publication_guard(root,manifest)
        require_source_binding()
        _revalidate_skipped_provenance(root,source_root,plan,published_snapshots)
        for index,(source_relative,destination_relative,overwrite) in enumerate(writes,1):
            _revalidate_skipped_provenance(root,source_root,plan,published_snapshots)
            destination=_safe_target(root,destination_relative); staged_path=staged/destination_relative
            with _attached_parent(root,destination_relative,target_parent_snapshots[destination_relative],create_missing=True,created=created,creation_directory=parent_pool_fd) as (_directory,parents):
                target_parents[destination_relative]=parents
            expected=next((entry for entry in plan["entries"] if entry["path"]==source_relative),None)
            if overwrite:
                original=_require_target_snapshot(root,destination_relative,targets[destination_relative])
                backup=backups/destination_relative; backup.parent.mkdir(parents=True,exist_ok=True)
                # Journal the owned source before the atomic move.  A terminal
                # signal may be delivered immediately after the rename syscall;
                # rollback must already know where the original belongs.
                displaced.append((destination,backup,original))
                with _attached_parent(backups,destination_relative) as (_directory,backup_parents):
                    _move_attached(root,destination_relative,target_parents[destination_relative],backups,backup_parents,original)
                moved=_target_snapshot(backups,destination_relative)
                displaced[-1]=(destination,backup,moved)
                if not _same_owned_file(original,moved):
                    raise AdoptionRefused(f"target changed during displacement: {destination_relative}")
            elif _attached_leaf_exists(root,destination_relative,target_parents[destination_relative]): raise AdoptionRefused(f"target changed after planning: {destination_relative}")
            staged_identity=staged_snapshots[destination_relative]
            _require_target_snapshot(staged,destination_relative,staged_identity)
            # As above, publish the rollback intent before the no-replace move.
            # The placeholder remains sufficient because inode/content identity
            # is stable across rename even though ctime may change.
            published.append((destination,staged_path,staged_identity))
            _move_attached(staged,destination_relative,staged_identity[0],root,target_parents[destination_relative],staged_identity)
            observed=_target_snapshot(root,destination_relative)
            if not _same_owned_file(staged_identity,observed) or observed[0]!=target_parents[destination_relative]:
                raise AdoptionRefused(f"target changed during publication: {destination_relative}")
            published_snapshots[destination_relative]=observed
            _revalidate_skipped_provenance(root,source_root,plan,published_snapshots)
            if fail_after is not None and index>=fail_after: raise OSError("injected adoption publication failure")
        if _publication_guard is not None: _publication_guard(root,manifest)
        require_source_binding()
        _revalidate_skipped_provenance(root,source_root,plan,published_snapshots)
        for destination,_staged_path,_identity in published:
            relative=destination.relative_to(root).as_posix()
            _require_target_snapshot(root,relative,published_snapshots[relative])
        for _destination,backup,identity in displaced:
            _require_target_snapshot(backups,backup.relative_to(backups).as_posix(),identity)
    except BaseException:
        # Roll back only the exact bytes/inode we published. Concurrent edits
        # and replacements remain named owner data; their originals stay in
        # recovery rather than being forced over the replacement.
        for destination,staged_path,identity in reversed(published):
            relative=destination.relative_to(root).as_posix()
            try:
                current=_target_snapshot(root,relative)
                if not _same_owned_file(current,identity): continue
                _move_attached(root,relative,target_parents[relative],staged,identity[0],current)
                recovered=_target_snapshot(staged,relative)
                if not _same_owned_file(recovered,identity):
                    _move_attached(staged,relative,identity[0],root,target_parents[relative],recovered)
            except (OSError,AdoptionRefused):
                continue
        for destination,backup,identity in reversed(displaced):
            relative=backup.relative_to(backups).as_posix()
            try:
                current=_target_snapshot(backups,relative)
                if not _same_owned_file(current,identity): continue
                _move_attached(backups,relative,current[0],root,target_parents[relative],current)
            except (OSError,AdoptionRefused):
                continue
        _rollback_created_parents(created,parent_pool_fd)
        _close_created_parents(created); _close_descriptor(parent_pool_fd)
        print(f"adoption failed; owned changes restored where safe; owner replacements and recovery staging preserved: {staging}",file=sys.stderr)
        raise
    # Publication is committed. There is no portable atomic unlink-by-inode;
    # original backups (and any concurrent replacements) remain quarantined
    # for explicit cleanup. Only empty directories may be removed automatically.
    _close_created_parents(created); _close_descriptor(parent_pool_fd)
    try:
        for directory in sorted((path for path in staging.rglob("*") if path.is_dir()),key=lambda path:len(path.parts),reverse=True):
            directory.rmdir()
        staging.rmdir()
    except (OSError,AdoptionRefused):
        plan["recovery_staging"]=str(staging)
        print(f"adoption published; original backups and recovery staging preserved for explicit cleanup: {staging}",file=sys.stderr)
    plan["reports"]=reports; plan["applied_writes"]=len(writes); return plan

def _private_identity(root: Path,name: str|None,slug: str|None,feature_prefix: str|None) -> tuple[str,str,str]:
    resolved_slug=slug or re.sub(r"[^a-z0-9]+","-",root.name.lower()).strip("-")
    if not re.fullmatch(r"[a-z][a-z0-9-]*",resolved_slug): raise AdoptionRefused("private adoption slug must match [a-z][a-z0-9-]*")
    resolved_name=(name or root.name.replace("-"," ").replace("_"," ").title()).strip()
    if not resolved_name or any(character in resolved_name for character in "\r\n\x00"): raise AdoptionRefused("private adoption name must be a nonempty single-line value")
    resolved_prefix=feature_prefix or re.sub(r"[^A-Z0-9]","",resolved_slug.upper())[:16] or "APP"
    if not re.fullmatch(r"[A-Z][A-Z0-9]{0,15}",resolved_prefix): raise AdoptionRefused("feature prefix must contain 1-16 uppercase letters or digits and start with a letter")
    return resolved_name,resolved_slug,resolved_prefix

def _replace_registry_path(registry: dict[str,Any],old: str,new: str) -> None:
    for document in registry.get("documents",[]):
        if document.get("path")==old: document["path"]=new

@contextmanager
def public_source(target: Path,distribution: str="shared"):
    """Prepare public-adoption bytes from the immutable target transformation."""
    prior_name=prior_slug=None
    project_path=target/"harness/project.json"
    if project_path.is_file() and not project_path.is_symlink():
        try:
            current=json.loads(project_path.read_text(encoding="utf-8"))
            if isinstance(current,dict) and current.get("run_meta_tests") is False:
                prior_name=current.get("name"); prior_slug=current.get("slug")
        except (OSError,UnicodeError,json.JSONDecodeError):
            pass
    resolved_name,resolved_slug,resolved_prefix=_private_identity(target,prior_name,prior_slug,None)
    template=private_template_root()
    with tempfile.TemporaryDirectory(prefix="repository-harness-public-source-") as temporary:
        source=Path(temporary)/"source"
        result=subprocess.run([sys.executable,str(template/"script/instantiate.py"),str(source),resolved_name,resolved_slug,"--feature-prefix",resolved_prefix,"--distribution",distribution],text=True,capture_output=True)
        if result.returncode:
            raise AdoptionRefused("could not prepare public harness source: "+(result.stderr.strip() or result.stdout.strip()))
        for path in (source/".git",source/".claude",source/".github"):
            if path.is_dir(): shutil.rmtree(path)
        # An existing shared installation carries a local state-domain marker.
        # Include its replacement in the ordinary staged adoption transaction
        # so the original checkout remains usable when public runtime changes.
        if os.path.lexists(target/".agent-harness/state-domain.json"):
            marker=source/".agent-harness/state-domain.json"
            marker.parent.mkdir(parents=True,exist_ok=True)
            marker.write_bytes((source/"harness/state-domain.json").read_bytes())
        (source/"harness/adoption-manifest.json").write_text(json.dumps(public_manifest(source),indent=2)+"\n",encoding="utf-8")
        yield source

def public_manifest(source: Path) -> dict[str,Any]:
    """Use the complete generated runtime while retaining public collision rules."""
    manifest=private_manifest(source,include_bootstrap=True)
    policies={
        "AGENTS.md":("side_by_side","AGENTS.harness.md"),
        "ARCHITECTURE.md":("side_by_side","ARCHITECTURE.harness.md"),
        "README.md":("side_by_side","README.harness.md"),
        ".gitignore":("merge_required",None),
    }
    for item in manifest["artifacts"]:
        policy=policies.get(item["path"])
        if policy is None: continue
        item["collision_policy"]=policy[0]
        if policy[1] is not None: item["side_by_side_name"]=policy[1]
    return manifest

def _is_privately_managed(root: Path,relative: str) -> bool:
    """Return true only when our delimited local-exclude block owns the path."""
    try:
        exclude=private_exclude_path(root)
        text=exclude.read_text(encoding="utf-8") if exclude.exists() else ""
    except (OSError,UnicodeError,AdoptionRefused):
        return False
    begin=text.find(PRIVATE_BEGIN); end=text.find(PRIVATE_END)
    if begin<0 or end<begin: return False
    rules={line.strip() for line in text[begin+len(PRIVATE_BEGIN):end].splitlines() if line.strip()}
    return "/"+relative in rules

def private_template_root(value: str|Path|None=None) -> Path:
    root=ROOT if value is None else Path(value).expanduser().resolve()
    project_path=root/"harness/project.json"; instantiator=root/"script/instantiate.py"
    if root.is_symlink() or not root.is_dir() or project_path.is_symlink() or not project_path.is_file():
        raise AdoptionRefused("private adoption source must be a repository-harness template root containing a regular harness/project.json file")
    try: project=json.loads(project_path.read_text(encoding="utf-8"))
    except (OSError,UnicodeError,json.JSONDecodeError) as exc: raise AdoptionRefused(f"invalid private adoption source project: {exc}") from exc
    if not project.get("run_meta_tests"):
        if value is None: raise AdoptionRefused("installed host repositories cannot serve as private adoption templates; rerun with --source-template /path/to/react-achievements")
        raise AdoptionRefused("--source-template must name a repository-harness template checkout, not an installed host repository")
    if instantiator.is_symlink() or not instantiator.is_file():
        raise AdoptionRefused("private adoption source must contain a regular script/instantiate.py file")
    return root

@contextmanager
def private_source(target: Path,name: str|None=None,slug: str|None=None,feature_prefix: str|None=None,source_template: str|Path|None=None,repository_kind: str|None=None):
    resolved_name,resolved_slug,resolved_prefix=_private_identity(target,name,slug,feature_prefix)
    template=private_template_root(source_template)
    if repository_kind is None:
        try:
            existing=json.loads((target/"harness/project.json").read_text(encoding="utf-8")); repository_kind=existing.get("classification",{}).get("repository_kind","unclassified")
        except (OSError,UnicodeError,json.JSONDecodeError): repository_kind="unclassified"
    with tempfile.TemporaryDirectory(prefix="repository-harness-private-source-") as temporary:
        source=Path(temporary)/"source"
        result=subprocess.run([sys.executable,str(template/"script/instantiate.py"),str(source),resolved_name,resolved_slug,"--feature-prefix",resolved_prefix,"--repository-kind",repository_kind,"--distribution","personal"],text=True,capture_output=True,env={**os.environ,"PYTHONDONTWRITEBYTECODE":"1"})
        if result.returncode: raise AdoptionRefused("could not prepare target-specific harness source: "+(result.stderr.strip() or result.stdout.strip()))
        for private_tool in (source/".claude",):
            if private_tool.exists(): shutil.rmtree(private_tool)
        for public_surface in (source/".gitignore",source/".github"):
            if public_surface.is_dir(): shutil.rmtree(public_surface)
            elif public_surface.exists(): public_surface.unlink()
        project_path=source/"harness/project.json"; project=json.loads(project_path.read_text(encoding="utf-8"))
        project["profiles"]["harness"]={"layer":"behavioral","commands":[],"unavailable":"Template harness self-tests are not installed in application repositories."}
        project_path.write_text(json.dumps(project,indent=2)+"\n",encoding="utf-8")
        registry_path=source/"docs/artifacts.json"; registry=json.loads(registry_path.read_text(encoding="utf-8"))
        (source/"AGENTS.md").rename(source/"AGENTS.override.md"); _replace_registry_path(registry,"AGENTS.md","AGENTS.override.md")
        for original,alternate in (("README.md","README.harness.md"),("ARCHITECTURE.md","ARCHITECTURE.harness.md")):
            if (target/original).exists() and not _is_privately_managed(target,original):
                (source/original).rename(source/alternate); _replace_registry_path(registry,original,alternate)
        registry["documents"].sort(key=lambda entry:entry["path"]); registry_path.write_text(json.dumps(registry,indent=2)+"\n",encoding="utf-8")
        generated=subprocess.run([sys.executable,"script/harness.py","generate-docs"],cwd=source,text=True,capture_output=True,env={**os.environ,"PYTHONDONTWRITEBYTECODE":"1"})
        if generated.returncode: raise AdoptionRefused("could not generate private harness documentation: "+(generated.stderr.strip() or generated.stdout.strip()))
        (source/"harness/adoption-manifest.json").write_text(json.dumps(private_manifest(source,include_bootstrap=True),indent=2)+"\n",encoding="utf-8")
        yield source,resolved_name,resolved_slug,resolved_prefix

def private_manifest(source: Path,*,include_bootstrap: bool=False) -> dict[str,Any]:
    artifacts=[]
    validate_batch_packaging(source)
    for path in sorted(candidate for candidate in source.rglob("*") if candidate.is_file() and ".git" not in candidate.relative_to(source).parts):
        relative=path.relative_to(source).as_posix()
        if relative.startswith(".agent-harness/"):
            expected=HARNESS_BOOTSTRAP.get(relative) if include_bootstrap else None
            if expected is None: continue
            if path.is_symlink() or path.read_bytes()!=expected:
                raise AdoptionRefused("generated harness-maintenance bootstrap is invalid")
        if relative.startswith("test/") or relative in {"bin/test-fast","bin/test-shards","script/fast_lifecycle.py","script/test_shards.py"} or relative in BATCH_ARTIFACTS or "__pycache__" in PurePosixPath(relative).parts:
            continue
        if relative.startswith("specs/") and not relative.startswith(APPLICATION_SPEC_ROOT):
            continue
        if relative.startswith(TEMPLATE_MAINTENANCE_PREFIXES):
            continue
        if not source_path_allowed(source,relative,trusted_generated=True):
            continue
        if path.is_symlink() or not safe_path(relative): raise AdoptionRefused(f"unsafe private adoption source: {relative}")
        if relative.startswith(("bin/","script/")) or relative=="init.sh": role="executable"
        elif relative in {"feature_list.json","harness/outcomes.json","harness/measurements.json"} or relative.startswith(".agent-harness/"): role="state"
        elif relative.endswith(".md"): role="documentation"
        else: role="contract"
        artifacts.append({"path":relative,"role":role,"collision_policy":"never_overwrite","required":True})
    if not artifacts: raise AdoptionRefused("private adoption source contains no artifacts")
    return {"schema":1,"artifacts":artifacts}


def _retained_personal_artifact_paths(root: Path) -> tuple[str,...]:
    relative="harness/adoption-manifest.json"
    if not os.path.lexists(root/relative): return ()
    try:
        payload=_planned_source_bytes(root,relative,None,_snapshot=True)[0]
        manifest=json.loads(payload.decode("utf-8"),object_pairs_hook=canonical_harness._reject_duplicate_json_keys)
        artifacts=manifest.get("artifacts") if isinstance(manifest,dict) else None
        if not isinstance(manifest,dict) or manifest.get("schema")!=1 or not isinstance(artifacts,list): raise ValueError("invalid manifest")
        return state_domains.retained_personal_artifact_paths(root,artifacts)
    except (OSError,UnicodeError,json.JSONDecodeError,ValueError,AdoptionRefused,state_domains.StateDomainError) as exc:
        raise AdoptionRefused("installed personal artifact manifest is invalid") from exc

def _require_untracked_personal_artifacts(root: Path, personal_paths: tuple[str,...]) -> None:
    runtime_paths=tuple(path for path in personal_paths if not is_private_git_path(path))
    if not runtime_paths: return
    indexed=subprocess.run(["git","--literal-pathspecs","ls-files","--cached","-z","--",*runtime_paths],
                           cwd=root,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
    if indexed.returncode or (indexed.stdout and not indexed.stdout.endswith(b"\0")):
        raise AdoptionRefused("personal artifact Git index cannot be checked")
    if indexed.stdout:
        raise AdoptionRefused("personal harness artifact is tracked or staged: "+os.fsdecode(indexed.stdout.split(b"\0",1)[0]))

def _git_path(root: Path,*arguments: str) -> Path:
    result=subprocess.run(["git","rev-parse",*arguments],cwd=root,text=True,capture_output=True)
    if result.returncode: raise AdoptionRefused("could not resolve repository-local Git metadata")
    value=Path(result.stdout.strip()); return Path(os.path.abspath(value if value.is_absolute() else root/value))

def _exclude_identity(metadata: os.stat_result) -> tuple[int,int,int,int,int,int]:
    return (metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns,metadata.st_ctime_ns)

def _exclude_directory_identity(metadata: os.stat_result) -> tuple[int,int,int]:
    return (metadata.st_dev,metadata.st_ino,metadata.st_mode)

def _private_exclude_directory(path: Path) -> tuple[int,int,tuple[int,int,int],tuple[int,int,int]]:
    """Pin the lexical common/info directories without following substitutions."""
    common=path.parent.parent; common_fd=info_fd=None
    try:
        common_lexical=os.stat(common,follow_symlinks=False)
        info_lexical=os.stat(path.parent,follow_symlinks=False)
        if not stat.S_ISDIR(common_lexical.st_mode) or not stat.S_ISDIR(info_lexical.st_mode): raise AdoptionRefused("repository-local exclusion path is unsafe")
        common_fd=os.open(common,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
        info_fd=os.open("info",os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=common_fd)
        common_identity=_exclude_directory_identity(os.fstat(common_fd)); info_identity=_exclude_directory_identity(os.fstat(info_fd))
        if common_identity!=_exclude_directory_identity(common_lexical) or info_identity!=_exclude_directory_identity(info_lexical): raise AdoptionRefused("repository-local exclusion path is unsafe")
        return common_fd,info_fd,common_identity,info_identity
    except Exception:
        if info_fd is not None: os.close(info_fd)
        if common_fd is not None: os.close(common_fd)
        raise

def _private_exclude_directories_match(path: Path,common_identity: tuple[int,int,int],info_identity: tuple[int,int,int]) -> bool:
    common_fd=info_fd=None
    try:
        common_fd,info_fd,current_common,current_info=_private_exclude_directory(path)
        return current_common==common_identity and current_info==info_identity
    except (OSError,AdoptionRefused): return False
    finally:
        if info_fd is not None: os.close(info_fd)
        if common_fd is not None: os.close(common_fd)

def _read_private_exclude(info_fd: int) -> tuple[bytes,tuple[int,int,int,int,int,int]|None]:
    descriptor=None
    try:
        try: descriptor=os.open("exclude",os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=info_fd)
        except FileNotFoundError: return b"",None
        before=os.fstat(descriptor)
        if not stat.S_ISREG(before.st_mode) or before.st_size>MAX_PRIVATE_EXCLUDE_BYTES: raise AdoptionRefused("repository-local exclusion path is unsafe")
        payload=bytearray()
        while True:
            block=os.read(descriptor,65536)
            if not block: break
            payload.extend(block)
            if len(payload)>MAX_PRIVATE_EXCLUDE_BYTES: raise AdoptionRefused("repository-local exclusion path is unsafe")
        after=os.fstat(descriptor)
        if _exclude_identity(before)!=_exclude_identity(after): raise AdoptionRefused("repository-local exclusion path is unsafe")
        return bytes(payload),_exclude_identity(after)
    except AdoptionRefused: raise
    except OSError as error: raise AdoptionRefused("repository-local exclusion path is unsafe") from error
    finally:
        if descriptor is not None: os.close(descriptor)

def private_exclude_state(path: Path) -> tuple[bytes,tuple[int,int,int,int,int,int]|None]:
    """Read the repository-local exclude file through lexical no-follow paths."""
    common_fd=info_fd=None
    try:
        common_fd,info_fd,_common_identity,_info_identity=_private_exclude_directory(path)
        return _read_private_exclude(info_fd)
    except AdoptionRefused: raise
    except OSError as error: raise AdoptionRefused("repository-local exclusion path is unsafe") from error
    finally:
        if info_fd is not None: os.close(info_fd)
        if common_fd is not None: os.close(common_fd)

def private_exclude_path(root: Path) -> Path:
    common=_git_path(root,"--git-common-dir"); exclude=_git_path(root,"--git-path","info/exclude")
    expected=Path(os.path.abspath(common/"info/exclude"))
    if exclude!=expected: raise AdoptionRefused("Git returned an ambiguous repository-local exclusion path")
    private_exclude_state(expected)
    return exclude

def private_exclusion_rules(manifest: dict[str,Any]) -> list[str]:
    return sorted({"/.agent-harness/",*private_git_exclusion_rules(),*("/"+item["path"] for item in manifest["artifacts"])})

def shared_exclusion_rules() -> list[str]:
    """Hide mutable application and harness state while leaving shared runtime visible."""
    return sorted({"/.agent-harness/",*private_git_exclusion_rules()})

def private_exclusion_content(existing: bytes,rules: list[str]) -> bytes:
    try: text=existing.decode("utf-8")
    except UnicodeDecodeError as exc: raise AdoptionRefused("repository-local exclusion file must be UTF-8") from exc
    begin,end=_private_exclusion_block_span(text)
    if begin>=0:
        end=end+len(PRIVATE_END)
        if end<len(text) and text[end:end+1]=="\n": end+=1
        text=text[:begin].rstrip("\n")+text[end:]
    block="\n".join([PRIVATE_BEGIN,*rules,PRIVATE_END])+"\n"
    prefix=(text.rstrip("\n")+"\n\n") if text.strip() else ""
    return (prefix+block).encode("utf-8")

def _private_exclusion_block_rules(existing: bytes) -> list[str]:
    try: text=existing.decode("utf-8")
    except UnicodeDecodeError as exc: raise AdoptionRefused("repository-local exclusion file must be UTF-8") from exc
    begin,end=_private_exclusion_block_span(text)
    if begin<0: return []
    return sorted({line.strip() for line in text[begin+len(PRIVATE_BEGIN):end].splitlines() if line.strip()})

def _private_exclusion_block_span(text: str) -> tuple[int,int]:
    """Reject ambiguous managed blocks before installation or update writes."""
    begin_count=text.count(PRIVATE_BEGIN); end_count=text.count(PRIVATE_END)
    if begin_count!=end_count or begin_count>1:
        raise AdoptionRefused("repository-local exclusion block is malformed")
    if begin_count==0: return -1,-1
    begin=text.index(PRIVATE_BEGIN); end=text.index(PRIVATE_END)
    if begin>=end: raise AdoptionRefused("repository-local exclusion block is malformed")
    return begin,end

def _before_private_exclude_replace() -> None:
    """Test seam for a directory swap immediately before descriptor publication."""

def _publish_exclude(path: Path,expected: tuple[bytes,tuple[int,int,int,int,int,int]|None],payload: bytes) -> tuple[bytes,tuple[int,int,int,int,int,int]|None]:
    common_fd=info_fd=descriptor=None; temporary=None
    try:
        common_fd,info_fd,common_identity,info_identity=_private_exclude_directory(path)
        current=_read_private_exclude(info_fd)
        if current!=expected: raise AdoptionRefused("repository-local exclusion file changed after planning")
        if current[0]==payload: return current
        for _attempt in range(32):
            temporary=f".repository-harness-exclude-{secrets.token_hex(16)}"
            try:
                descriptor=os.open(temporary,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_NOFOLLOW",0),0o600,dir_fd=info_fd); break
            except FileExistsError: temporary=None
        if descriptor is None: raise AdoptionRefused("repository-local exclusion publication could not reserve a safe temporary file")
        with os.fdopen(descriptor,"wb") as handle: handle.write(payload); handle.flush(); os.fsync(handle.fileno())
        descriptor=None
        if current[1] is not None: os.chmod(temporary,stat.S_IMODE(current[1][2]),dir_fd=info_fd,follow_symlinks=False)
        _before_private_exclude_replace()
        if not _private_exclude_directories_match(path,common_identity,info_identity): raise AdoptionRefused("repository-local exclusion path changed during publication")
        if _read_private_exclude(info_fd)!=expected: raise AdoptionRefused("repository-local exclusion file changed after planning")
        os.replace(temporary,"exclude",src_dir_fd=info_fd,dst_dir_fd=info_fd); temporary=None; os.fsync(info_fd)
        if not _private_exclude_directories_match(path,common_identity,info_identity): raise AdoptionRefused("repository-local exclusion path changed during publication")
        return _read_private_exclude(info_fd)
    finally:
        if descriptor is not None: os.close(descriptor)
        if temporary is not None and info_fd is not None:
            try: os.unlink(temporary,dir_fd=info_fd)
            except FileNotFoundError: pass
        if info_fd is not None: os.close(info_fd)
        if common_fd is not None: os.close(common_fd)

def private_exclusion_publication_guard(root: Path,manifest: dict[str,Any],path: Path,expected: tuple[bytes,tuple[int,int,int,int,int,int]|None]) -> None:
    private_target_manifest_index_guard(root,manifest)
    if private_exclude_state(path)!=expected: raise AdoptionRefused("repository-local exclusion file changed during private publication")
    _require_effective_private_exclusions(root,tuple(item["path"] for item in manifest["artifacts"]))


def _require_effective_private_exclusions(root: Path, additional_paths: tuple[str,...]=()) -> None:
    if not private_git_exclusions_effective(root,additional_paths):
        raise AdoptionRefused("repository ignore rules override required private feature-state exclusions")

def _before_private_inventory_leaf_open(_parent_fd: int,_name: str) -> None:
    """Test seam for an owner replacement between lstat and open."""

def _after_private_inventory_leaf_open(_parent_fd: int,_name: str) -> None:
    """Test seam for an owner replacement after open."""

def _private_state_inventory(root: Path, additional_paths: tuple[str,...]=()) -> tuple | None:
    """Bind private leaves before publication; uncertainty retains Git exclusions."""
    entries={}
    descriptors=[]
    attachments=[]
    leaf_checks=[]
    absence_checks=[]
    directory_checks=[]
    attachment=lambda value:(value.st_dev,value.st_ino,value.st_mode,value.st_size,value.st_mtime_ns,value.st_ctime_ns)
    try:
        root_fd=os.open(root,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0))
        descriptors.append(root_fd)
        root_identity=attachment(os.fstat(root_fd))[:3]
        if attachment(os.stat(root,follow_symlinks=False))[:3]!=root_identity: raise AdoptionRefused("private state root changed during inventory")
        def visit(parent_fd: int,name: str,relative: str) -> None:
            if relative in entries: return
            try: metadata=os.stat(name,dir_fd=parent_fd,follow_symlinks=False)
            except FileNotFoundError:
                absence_checks.append((parent_fd,name))
                return
            if len(entries)>=4096: raise AdoptionRefused("private state inventory is too large")
            initial=attachment(metadata)
            if stat.S_ISDIR(metadata.st_mode):
                child_fd=os.open(name,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=parent_fd)
                descriptors.append(child_fd)
                if attachment(os.fstat(child_fd))[:3]!=initial[:3]: raise AdoptionRefused("private directory changed during inventory")
                attachments.append((parent_fd,name,child_fd,initial[:3]))
                entries[relative]=("directory",)
                names=sorted(os.listdir(child_fd))
                children={child:attachment(os.stat(child,dir_fd=child_fd,follow_symlinks=False))[:3] for child in names}
                directory_checks.append((child_fd,names,children))
                for child in names: visit(child_fd,child,relative+"/"+child)
                if sorted(os.listdir(child_fd))!=names: raise AdoptionRefused("private directory changed during inventory")
                for child,identity in children.items():
                    if attachment(os.stat(child,dir_fd=child_fd,follow_symlinks=False))[:3]!=identity:
                        raise AdoptionRefused("private child changed during inventory")
                if (attachment(os.fstat(child_fd))[:3]!=initial[:3]
                        or attachment(os.stat(name,dir_fd=parent_fd,follow_symlinks=False))[:3]!=initial[:3]):
                    raise AdoptionRefused("private directory detached during inventory")
            elif stat.S_ISREG(metadata.st_mode):
                digest=hashlib.sha256()
                _before_private_inventory_leaf_open(parent_fd,name)
                descriptor=os.open(name,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=parent_fd)
                try:
                    _after_private_inventory_leaf_open(parent_fd,name)
                    if attachment(os.fstat(descriptor))!=initial: raise AdoptionRefused("private file changed during inventory")
                    total=0
                    while chunk:=os.read(descriptor,1024*1024):
                        total+=len(chunk)
                        if total>MAX_ADOPTION_SOURCE_BYTES: raise AdoptionRefused("private state file is too large to inventory")
                        digest.update(chunk)
                    if (attachment(os.fstat(descriptor))!=initial
                            or attachment(os.stat(name,dir_fd=parent_fd,follow_symlinks=False))!=initial):
                        raise AdoptionRefused("private file detached during inventory")
                finally: os.close(descriptor)
                entries[relative]=(metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns,digest.hexdigest())
                leaf_checks.append((parent_fd,name,initial))
            elif stat.S_ISLNK(metadata.st_mode):
                target=os.readlink(name,dir_fd=parent_fd)
                if attachment(os.stat(name,dir_fd=parent_fd,follow_symlinks=False))!=initial:
                    raise AdoptionRefused("private symlink changed during inventory")
                entries[relative]=(metadata.st_dev,metadata.st_ino,metadata.st_mode,target)
                leaf_checks.append((parent_fd,name,initial))
            else:
                if attachment(os.stat(name,dir_fd=parent_fd,follow_symlinks=False))!=initial:
                    raise AdoptionRefused("private state changed during inventory")
                entries[relative]=(metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns)
                leaf_checks.append((parent_fd,name,initial))
        for relative in (*state_domains.PRIVATE_GIT_PATHS,*additional_paths):
            if not safe_path(relative): raise AdoptionRefused("private state inventory path is unsafe")
            parts=relative.split("/"); parent_fd=root_fd
            for part in parts[:-1]:
                try: next_fd=os.open(part,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=parent_fd)
                except FileNotFoundError:
                    absence_checks.append((parent_fd,part))
                    break
                descriptors.append(next_fd)
                identity=attachment(os.fstat(next_fd))[:3]
                if attachment(os.stat(part,dir_fd=parent_fd,follow_symlinks=False))[:3]!=identity:
                    raise AdoptionRefused("private parent changed during inventory")
                attachments.append((parent_fd,part,next_fd,identity)); parent_fd=next_fd
            else: visit(parent_fd,parts[-1],relative)
        for parent_fd,name,identity in leaf_checks:
            if attachment(os.stat(name,dir_fd=parent_fd,follow_symlinks=False))!=identity:
                raise AdoptionRefused("private leaf changed during inventory")
        for parent_fd,name in absence_checks:
            try: os.stat(name,dir_fd=parent_fd,follow_symlinks=False)
            except FileNotFoundError: continue
            raise AdoptionRefused("absent private path appeared during inventory")
        for child_fd,names,children in directory_checks:
            if sorted(os.listdir(child_fd))!=names: raise AdoptionRefused("private directory listing changed during inventory")
            for child,identity in children.items():
                if attachment(os.stat(child,dir_fd=child_fd,follow_symlinks=False))[:3]!=identity:
                    raise AdoptionRefused("private child changed during inventory")
        for parent_fd,name,child_fd,identity in attachments:
            if (attachment(os.fstat(child_fd))[:3]!=identity
                    or attachment(os.stat(name,dir_fd=parent_fd,follow_symlinks=False))[:3]!=identity):
                raise AdoptionRefused("private parent detached during inventory")
        if attachment(os.stat(root,follow_symlinks=False))[:3]!=root_identity: raise AdoptionRefused("private state root detached during inventory")
        return tuple(sorted(entries.items()))
    except (OSError,ValueError,AdoptionRefused):
        return None
    finally:
        for descriptor in reversed(descriptors): os.close(descriptor)

def _validate_private_install(root: Path) -> None:
    required=("AGENTS.override.md",".specify/feature.json","bin/agent-session","script/harness.py","feature_list.json","harness/model-routing.json")
    missing=[path for path in required if not (root/path).is_file()]
    if missing: raise AdoptionRefused("private adoption validation missing "+missing[0])
    pointer=json.loads((root/".specify/feature.json").read_text(encoding="utf-8")); feature=pointer.get("feature_directory")
    if not safe_path(feature) or not (root/feature/"spec.md").is_file(): raise AdoptionRefused("private adoption feature pointer is invalid")
    if len(list((root/".agents/skills").glob("speckit-*/SKILL.md")))!=10: raise AdoptionRefused("private adoption must install all ten Spec Kit skills")

def private_adoption_plan(target: str|Path,authorized: set[str]|None=None,name: str|None=None,slug: str|None=None,feature_prefix: str|None=None,source_template: str|Path|None=None,repository_kind: str|None=None) -> dict[str,Any]:
    root=target_root(target)
    template=private_template_root(source_template)
    with private_source(root,name,slug,feature_prefix,template,repository_kind) as (source,resolved_name,resolved_slug,resolved_prefix):
        manifest=private_manifest(source,include_bootstrap=True); private_target_manifest_index_guard(root,manifest); plan=adoption_plan(root,authorized,manifest,source,provenance_root=template,_capability=_GENERATED_CAPABILITY)
        exclude=private_exclude_path(root); rules=private_exclusion_rules(manifest); current,_identity=private_exclude_state(exclude)
        plan.update(private=True,name=resolved_name,slug=resolved_slug,feature_prefix=resolved_prefix,harness_source_commit=source_commit(template),local_exclude_path=str(exclude),local_exclude_digest=hashlib.sha256(current).hexdigest(),exclusion_rules=rules)
        _plan_application_state_untracking(root,plan)
        return plan

def apply_private_adoption(target: str|Path,authorized: set[str]|None=None,name: str|None=None,slug: str|None=None,feature_prefix: str|None=None,fail_after: int|None=None,source_template: str|Path|None=None,repository_kind: str|None=None) -> dict[str,Any]:
    root=target_root(target); authorizations=authorized or set()
    template=private_template_root(source_template)
    with private_source(root,name,slug,feature_prefix,template,repository_kind) as (source,resolved_name,resolved_slug,resolved_prefix):
        manifest=private_manifest(source,include_bootstrap=True); private_target_manifest_index_guard(root,manifest); plan=adoption_plan(root,authorizations,manifest,source,provenance_root=template,_capability=_GENERATED_CAPABILITY)
        _plan_application_state_untracking(root,plan)
        if _state_index_blockers_require_stop(plan): raise AdoptionRefused("cannot safely untrack application feature state: "+plan["application_state_index_blockers"][0])
        integrated_update=plan.get("integrated_provenance") is True
        bootstrap=set(HARNESS_BOOTSTRAP)
        unresolved=[entry for entry in plan["entries"] if entry["classification"]=="colliding" and entry["resolution"]=="skip" and entry["path"] not in bootstrap and not is_private_git_path(entry["path"]) and not (integrated_update and entry["path"]=="harness/project.json")]
        if unresolved: raise AdoptionRefused(f"private adoption collision at {unresolved[0]['path']}; rerun with --authorize {unresolved[0]['path']}")
        exclude=private_exclude_path(root); prior_state=private_exclude_state(exclude); prior=prior_state[0]; rules=private_exclusion_rules(manifest); updated=private_exclusion_content(prior,rules); exclude_changed=updated!=prior; published_state=prior_state
        private_paths=tuple(item["path"] for item in manifest["artifacts"])
        private_before=_private_state_inventory(root,private_paths)
        if private_before is None: raise AdoptionRefused("private state could not be inventoried before adoption")
        if exclude_changed: published_state=_publish_exclude(exclude,prior_state,updated)
        reservation=[None]
        def publication_guard(guard_root: Path,guard_manifest: dict[str,Any]) -> None:
            private_exclusion_publication_guard(guard_root,guard_manifest,exclude,published_state)
            if reservation[0] is None:
                reservation[0]=_reserve_application_state_index(guard_root,plan["application_state_index_snapshot"],plan["application_state_index_digest"])
            elif _index_digest(_git_index_path(guard_root))!=plan["application_state_index_digest"]:
                raise AdoptionRefused("repository Git index changed after planning")
        adoption_published=False
        try:
            _require_effective_private_exclusions(root,tuple(item["path"] for item in manifest["artifacts"]))
            result=apply_adoption(root,authorizations,fail_after,manifest,source,provenance_root=template,_capability=_GENERATED_CAPABILITY,_publication_guard=publication_guard)
            adoption_published=True
            _require_effective_private_exclusions(root,tuple(item["path"] for item in manifest["artifacts"]))
            removed=_untrack_application_state(root,plan["application_state_index_snapshot"],plan["application_state_index_digest"],reservation[0])
        except BaseException:
            if (not adoption_published and exclude_changed and private_before is not None
                    and _private_state_inventory(root,private_paths)==private_before
                    and private_exclude_state(exclude)==published_state): _publish_exclude(exclude,published_state,prior)
            raise
        finally: _release_application_state_index(reservation[0])
        _validate_private_install(root)
        result.update(private=True,name=resolved_name,slug=resolved_slug,feature_prefix=resolved_prefix,harness_source_commit=source_commit(template),local_exclude_path=str(exclude),exclusion_rules=rules,untracked_application_state_paths=removed)
        return result

def public_adoption_plan(target: str|Path,authorized: set[str]|None=None,distribution: str="shared") -> dict[str,Any]:
    root=target_root(target)
    with public_source(root,distribution) as source:
        manifest=public_manifest(source)
        plan=adoption_plan(root,authorized,manifest,source,provenance_root=ROOT,_capability=_GENERATED_CAPABILITY)
        exclude=private_exclude_path(root); current,_identity=private_exclude_state(exclude)
        rules=shared_exclusion_rules() if distribution=="shared" else private_exclusion_rules(manifest)
        plan.update(private=distribution=="personal",local_exclude_path=str(exclude),local_exclude_digest=hashlib.sha256(current).hexdigest(),exclusion_rules=rules)
        _plan_application_state_untracking(root,plan)
        return plan

def apply_public_adoption(target: str|Path,authorized: set[str]|None=None,fail_after: int|None=None,distribution: str="shared") -> dict[str,Any]:
    root=target_root(target); authorizations=authorized or set()
    with public_source(root,distribution) as source:
        manifest=public_manifest(source); plan=adoption_plan(root,authorizations,manifest,source,provenance_root=ROOT,_capability=_GENERATED_CAPABILITY)
        _plan_application_state_untracking(root,plan)
        if _state_index_blockers_require_stop(plan): raise AdoptionRefused("cannot safely untrack application feature state: "+plan["application_state_index_blockers"][0])
        exclude=private_exclude_path(root); prior_state=private_exclude_state(exclude)
        rules=shared_exclusion_rules() if distribution=="shared" else private_exclusion_rules(manifest)
        updated=private_exclusion_content(prior_state[0],rules); changed=updated!=prior_state[0]
        private_paths=tuple(item["path"] for item in manifest["artifacts"]) if distribution=="personal" else ()
        private_before=_private_state_inventory(root,private_paths)
        if private_before is None: raise AdoptionRefused("private state could not be inventoried before adoption")
        published_state=_publish_exclude(exclude,prior_state,updated) if changed else prior_state
        reservation=[None]
        def publication_guard(guard_root: Path,guard_manifest: dict[str,Any]) -> None:
            if private_exclude_state(exclude)!=published_state:
                raise AdoptionRefused("repository-local exclusion file changed during adoption publication")
            _require_effective_private_exclusions(guard_root,tuple(item["path"] for item in manifest["artifacts"]) if distribution=="personal" else ())
            if reservation[0] is None:
                reservation[0]=_reserve_application_state_index(guard_root,plan["application_state_index_snapshot"],plan["application_state_index_digest"])
            elif _index_digest(_git_index_path(guard_root))!=plan["application_state_index_digest"]:
                raise AdoptionRefused("repository Git index changed after planning")
        adoption_published=False
        try:
            _require_effective_private_exclusions(root,tuple(item["path"] for item in manifest["artifacts"]) if distribution=="personal" else ())
            result=apply_adoption(root,authorizations,fail_after,manifest,source,provenance_root=ROOT,_capability=_GENERATED_CAPABILITY,_publication_guard=publication_guard)
            adoption_published=True
            _require_effective_private_exclusions(root,tuple(item["path"] for item in manifest["artifacts"]) if distribution=="personal" else ())
            removed=_untrack_application_state(root,plan.get("application_state_index_snapshot",[]),plan["application_state_index_digest"],reservation[0])
        except BaseException:
            if (not adoption_published and changed and private_before is not None
                    and _private_state_inventory(root,private_paths)==private_before
                    and private_exclude_state(exclude)==published_state): _publish_exclude(exclude,published_state,prior_state[0])
            raise
        finally: _release_application_state_index(reservation[0])
        result.update(private=distribution=="personal",local_exclude_path=str(exclude),exclusion_rules=rules,harness_source_commit=source_commit(ROOT),untracked_application_state_paths=removed)
        return result

def parse_authorizations(values: list[str]) -> set[str]:
    result=set()
    for value in values:
        if not safe_path(value) or value in result: raise AdoptionRefused("--authorize must name one exact repo-relative path per occurrence; wildcards and duplicate or multi-path values are rejected")
        result.add(value)
    return result

def _release_contract(source: Path) -> dict[str, Any]:
    try:
        version=json.loads((source/"harness/version.json").read_text(encoding="utf-8"))
        domain=json.loads((source/"harness/state-domain.json").read_text(encoding="utf-8"))
    except (OSError,UnicodeError,json.JSONDecodeError) as exc:
        raise AdoptionRefused(f"v2 release contract is unavailable: {exc}") from exc
    if version.get("version")!="2.5.3" or version.get("previous_version")!="2.5.2":
        raise AdoptionRefused("update source is not the supported 2.5.3 release")
    if domain.get("separation",{}).get("harness_state_root")!=V2_STATE_ROOT:
        raise AdoptionRefused("v2 state-domain contract has an invalid harness root")
    return {"version":version,"domain":domain}

def _canonical_update_bytes(value: object) -> bytes:
    return (json.dumps(value,sort_keys=True,separators=(",",":"),ensure_ascii=True,allow_nan=False)+"\n").encode("utf-8")

def _update_completion_receipt(source_version: str, planned: list[dict[str,Any]], preserved: list[str]) -> tuple[str,dict[str,Any]]:
    artifacts=[{"source":item["source"],"destination":item["destination"],"sha256":item["source_digest"],"mode":item["source_mode"]} for item in planned]
    provenance=[f"{V2_STATE_ROOT}/{path}" for path in PROVENANCE_ARTIFACTS]
    if not set(provenance)<=set(item["destination"] for item in artifacts):
        raise AdoptionRefused("update release contract omits required provenance artifacts")
    contract={"schema":1,"migration_id":V2_MIGRATION_ID,"source_version":source_version,"artifacts":artifacts,"provenance_artifacts":provenance,"preserved_owner_paths":preserved}
    release_digest=hashlib.sha256(_canonical_update_bytes(contract)).hexdigest()
    receipt={"schema":2,"migration_id":V2_MIGRATION_ID,"source_version":source_version,"target_version":source_version,"release_digest":release_digest,"state":"completed","artifact_contract":artifacts,"artifact_contract_digest":hashlib.sha256(_canonical_update_bytes(artifacts)).hexdigest(),"provenance_artifacts":provenance,"preserved_owner_paths":preserved}
    return f"{V2_STATE_ROOT}/migrations/{release_digest}.json",receipt

def _update_artifacts_match(root: Path, planned: list[dict[str,Any]]) -> bool:
    try:
        for item in planned:
            current=_target_snapshot(root,item["destination"])
            expected_digest=item.get("source_digest",item.get("sha256")); expected_mode=item.get("source_mode",item.get("mode"))
            if current[2]!=expected_digest or stat.S_IMODE(current[1][2])!=expected_mode:
                return False
    except (OSError,AdoptionRefused):
        return False
    return True

def _update_installation_complete(root: Path, planned: list[dict[str,Any]], receipt_relative: str, receipt: dict[str,Any]) -> bool:
    if not _update_artifacts_match(root,planned): return False
    try:
        payload,mode=_planned_source_bytes(root,receipt_relative,None,_snapshot=True)[:2]
    except (OSError,AdoptionRefused):
        return False
    return mode==0o644 and payload==json.dumps(receipt,indent=2).encode("utf-8")+b"\n"

def _publish_planned_update_exclusion(plan: dict[str,Any]) -> tuple[tuple[bytes,tuple[int,int,int,int,int,int]|None],tuple[bytes,tuple[int,int,int,int,int,int]|None]]:
    path=Path(plan["local_exclude_path"]); current=private_exclude_state(path)
    identity=list(current[1]) if current[1] is not None else None
    if hashlib.sha256(current[0]).hexdigest()!=plan["local_exclude_digest"] or identity!=plan["local_exclude_identity"]:
        raise AdoptionRefused("repository-local exclusion changed after update planning")
    rules=sorted(set(_private_exclusion_block_rules(current[0]))|set(plan["local_exclude_rules"]))
    candidate=private_exclusion_content(current[0],rules)
    published=current if candidate==current[0] else _publish_exclude(path,current,candidate)
    return current,published

def _require_update_source(source: Path, item: dict[str,Any]) -> tuple[bytes,int]:
    if item.get("bootstrap") is True:
        payload=HARNESS_BOOTSTRAP.get(item.get("bootstrap_path"))
        if payload is None or hashlib.sha256(payload).hexdigest()!=item["source_digest"]:
            raise AdoptionRefused(f"update bootstrap contract is invalid: {item.get('destination')}")
        return payload,item["source_mode"]
    payload,mode,snapshot=_planned_source_bytes(source,item["source"],item.get("source_snapshot_digest",item["source_digest"]),_snapshot=True)
    if snapshot!=item["source_snapshot"] or mode!=item["source_mode"]:
        raise AdoptionRefused(f"update source identity or mode changed after planning: {item['source']}")
    if item.get("distribution_marker") is True:
        payload=(json.dumps({"schema":1,"distribution":item.get("distribution")},indent=2)+"\n").encode("utf-8")
        if hashlib.sha256(payload).hexdigest()!=item["source_digest"]:
            raise AdoptionRefused("update distribution marker changed after planning")
    return payload,mode

def _revalidate_skipped_update_targets(root: Path, source: Path, skipped: list[dict[str,Any]]) -> None:
    for item in skipped:
        _require_update_source(source,item)
        current=_require_target_snapshot(root,item["destination"],item["target_snapshot"])
        if current[2]!=item["source_digest"] or stat.S_IMODE(current[1][2])!=item["source_mode"]:
            raise AdoptionRefused(f"planned identical update target changed: {item['destination']}")

def update_plan(target: str|Path, source_template: str|Path|None=None) -> dict[str,Any]:
    """Produce a read-only v1-to-v2 plan; owner state is never a write target."""
    root=target_root(target); source=private_template_root(source_template); contract=_release_contract(source)
    exclude_path=private_exclude_path(root); exclude_before=private_exclude_state(exclude_path)
    _validate_existing_harness_bootstrap(root)
    distribution=_installed_distribution(root,exclude_before[0])
    if distribution=="shared" and os.path.lexists(root/"harness/project.json"):
        # A private-runtime migration cannot stand in for a shared release.
        # Existing shared checkouts need the public adoption path whenever
        # their tracked runtime lacks this release's clone setup contract.
        required=("script/harness.py","script/local_bootstrap.py","bin/agent-local-init","harness/local-state-seed.json")
        for relative in required:
            candidate=root/relative
            if candidate.is_symlink() or not candidate.is_file():
                raise AdoptionRefused("shared runtime update requires public plan/apply --distribution shared before private migration")
        if (root/"script/harness.py").read_bytes()!=(source/"script/harness.py").read_bytes():
            raise AdoptionRefused("shared runtime update requires public plan/apply --distribution shared before private migration")
        try:
            seed=json.loads((root/"harness/local-state-seed.json").read_text(encoding="utf-8"))
            installed_project=json.loads((root/"harness/project.json").read_text(encoding="utf-8"))
        except (OSError,UnicodeError,json.JSONDecodeError) as exc:
            raise AdoptionRefused("shared runtime update requires public plan/apply --distribution shared before private migration") from exc
        if (not isinstance(seed,dict) or seed.get("schema")!=1 or not isinstance(seed.get("files"),dict) or not seed["files"]
                or not isinstance(installed_project,dict) or installed_project.get("installation")!={"schema":1,"distribution":"shared"}):
            raise AdoptionRefused("shared runtime update requires public plan/apply --distribution shared before private migration")
    manifest=private_manifest(source)
    # Update artifacts are published under .agent-harness. Only artifacts
    # retained at the repository root need individual personal exclusions.
    personal_paths=_retained_personal_artifact_paths(root) if distribution=="personal" else ()
    _require_untracked_personal_artifacts(root,personal_paths)
    existing_rules=set(_private_exclusion_block_rules(exclude_before[0]))
    legacy_personal_paths=state_domains.legacy_personal_rule_paths(existing_rules) if distribution=="personal" else ()
    exclude_rules=sorted(existing_rules|{"/.agent-harness/",*private_git_exclusion_rules(),*("/"+path for path in personal_paths)})
    exclude_candidate=private_exclusion_content(exclude_before[0],exclude_rules)
    exclude_identity=list(exclude_before[1]) if exclude_before[1] is not None else None
    target_version="absent"
    for relative in (".agent-harness/harness/version.json","harness/version.json"):
        candidate=root/relative
        if os.path.lexists(candidate):
            try: target_version=json.loads(_planned_source_bytes(root,relative,None,_snapshot=True)[0].decode("utf-8")).get("version","invalid")
            except (OSError,UnicodeError,json.JSONDecodeError,AdoptionRefused): target_version="invalid"
            break
    if target_version not in UPDATEABLE_V2_TARGETS: raise AdoptionRefused(f"unsupported target harness version: {target_version}")
    planned=[]; preserved=[]; collisions=[]
    for item in manifest["artifacts"]:
        path=item["path"]
        if path in V2_OWNER_PATHS or path.startswith(("specs/","docs/","feature_list.json","PROGRESS.md")):
            preserved.append(path); continue
        destination=f"{V2_STATE_ROOT}/{path}"
        target_path=_safe_target(root,destination)
        target_snapshot=_target_snapshot(root,destination) if os.path.lexists(target_path) else None
        payload,source_mode,source_snapshot=_planned_source_bytes(source,path,None,_snapshot=True)
        source_snapshot_digest=hashlib.sha256(payload).hexdigest()
        distribution_marker=path=="harness/distribution.json"
        if distribution_marker:
            payload=(json.dumps({"schema":1,"distribution":distribution},indent=2)+"\n").encode("utf-8")
        source_digest=hashlib.sha256(payload).hexdigest()
        identical=target_snapshot is not None and source_digest==target_snapshot[2] and source_mode==stat.S_IMODE(target_snapshot[1][2])
        entry={"source":path,"destination":destination,"source_digest":source_digest,"source_mode":source_mode,"source_snapshot":source_snapshot,"target_snapshot":target_snapshot,"target_parent_snapshot":_existing_parent_snapshot(root,destination),"classification":"absent" if target_snapshot is None else ("identical" if identical else "colliding")}
        if distribution_marker: entry.update(distribution_marker=True,distribution=distribution,source_snapshot_digest=source_snapshot_digest)
        planned.append(entry)
        if entry["classification"]=="colliding": collisions.append(destination)
    preserved=sorted(set(preserved)); receipt_relative,receipt=_update_completion_receipt(contract["version"]["version"],planned,preserved); receipt_target=_safe_target(root,receipt_relative)
    receipt_snapshot=_target_snapshot(root,receipt_relative) if os.path.lexists(receipt_target) else None
    bootstrap_writes=[]
    for path,payload in HARNESS_BOOTSTRAP.items():
        destination=path
        target_path=_safe_target(root,destination)
        target_snapshot=_target_snapshot(root,destination) if os.path.lexists(target_path) else None
        migrate_legacy=False
        if path==".agent-harness/state-domain.json" and target_snapshot is not None:
            previous_bytes=_planned_source_bytes(root,destination,target_snapshot[2])[0]
            if previous_bytes!=payload:
                migrate_legacy=(previous_bytes==LEGACY_STATE_DOMAIN_BOOTSTRAP or _recognized_previous_state_domain(previous_bytes))
                if not migrate_legacy:
                    raise AdoptionRefused("private runtime update requires an exact recognized predecessor local state-domain marker")
        if target_snapshot is None or migrate_legacy:
            bootstrap_writes.append({"destination":destination,"bootstrap":True,"bootstrap_path":path,"source_digest":hashlib.sha256(payload).hexdigest(),"source_mode":0o644,"target_snapshot":target_snapshot,"target_parent_snapshot":_existing_parent_snapshot(root,destination)})
    plan={"schema":1,"source_root":str(source),"source_version":contract["version"]["version"],"target_version":target_version,"target_root":str(root),"distribution":distribution,"personal_paths":personal_paths,"legacy_personal_paths":legacy_personal_paths,"migration_id":V2_MIGRATION_ID,"planned_writes":planned,"bootstrap_writes":bootstrap_writes,"preserved_owner_paths":preserved,"collisions":collisions,"authorizations":[],"rollback":"retain recovery directory on interruption","receipt_relative":receipt_relative,"receipt_snapshot":receipt_snapshot,"receipt_parent_snapshot":_existing_parent_snapshot(root,receipt_relative),"completion_receipt":receipt,"local_exclude_path":str(exclude_path),"local_exclude_digest":hashlib.sha256(exclude_before[0]).hexdigest(),"local_exclude_identity":exclude_identity,"local_exclude_rule":"/.agent-harness/","local_exclude_rules":exclude_rules,"local_exclude_changed":exclude_candidate!=exclude_before[0]}
    _plan_application_state_untracking(root,plan)
    if target_version==contract["version"]["version"] and not bootstrap_writes and _update_installation_complete(root,planned,receipt_relative,receipt):
        plan.update(planned_writes=[],collisions=[],rollback="no-op",no_op=not plan["local_exclude_changed"],exclusion_only=plan["local_exclude_changed"])
    plan["plan_digest"]=hashlib.sha256(json.dumps(plan,sort_keys=True,separators=(",",":")).encode()).hexdigest()
    return plan

def apply_update(target: str|Path, authorized: set[str]|None=None, source_template: str|Path|None=None, fail_after: int|None=None) -> dict[str,Any]:
    """Apply a planned v1-to-v2 state migration without touching application state."""
    authorizations=authorized or set(); plan=update_plan(target,source_template); root=Path(plan["target_root"])
    _require_untracked_personal_artifacts(root,tuple(plan["personal_paths"]))
    effective_personal_paths=tuple(sorted(set(plan["personal_paths"])|set(plan["legacy_personal_paths"])))
    if plan.get("no_op"):
        if _state_index_blockers_require_stop(plan):
            raise AdoptionRefused("cannot safely untrack application feature state: "+plan["application_state_index_blockers"][0])
        if not _update_installation_complete(root,plan["completion_receipt"]["artifact_contract"],plan["receipt_relative"],plan["completion_receipt"]):
            raise AdoptionRefused("completed update contract changed during no-op validation")
        current=private_exclude_state(Path(plan["local_exclude_path"]))
        identity=list(current[1]) if current[1] is not None else None
        if hashlib.sha256(current[0]).hexdigest()!=plan["local_exclude_digest"] or identity!=plan["local_exclude_identity"]: raise AdoptionRefused("repository-local exclusion changed after update planning")
        _require_effective_private_exclusions(root,effective_personal_paths)
        removed=_untrack_application_state(root,plan["application_state_index_snapshot"],plan["application_state_index_digest"])
        return {"plan":plan,"receipt":None,"receipt_path":None,"published":[],"untracked_application_state_paths":removed}
    if plan.get("exclusion_only"):
        if _state_index_blockers_require_stop(plan):
            raise AdoptionRefused("cannot safely untrack application feature state: "+plan["application_state_index_blockers"][0])
        private_before=_private_state_inventory(root,effective_personal_paths)
        if private_before is None: raise AdoptionRefused("private state could not be inventoried before update")
        before,published=_publish_planned_update_exclusion(plan)
        exclude_path=Path(plan["local_exclude_path"])
        try:
            _require_effective_private_exclusions(root,effective_personal_paths)
            if not _update_installation_complete(root,plan["completion_receipt"]["artifact_contract"],plan["receipt_relative"],plan["completion_receipt"]):
                raise AdoptionRefused("installed artifact contract changed during exclusion-only update")
            if private_exclude_state(exclude_path)!=published:
                raise AdoptionRefused("repository-local exclusion changed before exclusion-only update completion")
            removed=_untrack_application_state(root,plan["application_state_index_snapshot"],plan["application_state_index_digest"])
        except BaseException as exc:
            if (not isinstance(exc,IndexPublicationUncertain)
                    and _original_index_is_current(root,plan["application_state_index_digest"])
                    and private_before is not None
                    and _private_state_inventory(root,effective_personal_paths)==private_before
                    and private_exclude_state(exclude_path)==published):
                _publish_exclude(exclude_path,published,before[0])
            raise
        return {"plan":plan,"receipt":None,"receipt_path":None,"published":[],"untracked_application_state_paths":removed}
    unknown=sorted(authorizations-set(plan["collisions"]))
    if unknown: raise AdoptionRefused(f"--authorize does not match a planned collision: {unknown[0]}")
    unauthorized=[path for path in plan["collisions"] if path not in authorizations]
    if unauthorized: raise AdoptionRefused(f"unauthorized collision at {unauthorized[0]}; rerun with --authorize {unauthorized[0]}")
    if _state_index_blockers_require_stop(plan):
        raise AdoptionRefused("cannot safely untrack application feature state: "+plan["application_state_index_blockers"][0])
    private_before=_private_state_inventory(root,effective_personal_paths)
    if private_before is None: raise AdoptionRefused("private state could not be inventoried before update")
    source=Path(plan["source_root"]); staging=Path(tempfile.mkdtemp(prefix=".agent-harness-update-",dir=root.parent)); staged=staging/"new"; backups=staging/"original"; parent_pool=staging/"parents"; staged.mkdir(); backups.mkdir(); parent_pool.mkdir(); parent_pool_fd=os.open(parent_pool,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
    writes=[item for item in plan["planned_writes"] if item["classification"]=="absent" or item["destination"] in authorizations]
    writes.extend(plan.get("bootstrap_writes",[]))
    version_destination=f"{V2_STATE_ROOT}/harness/version.json"; writes.sort(key=lambda item:(item["destination"]==version_destination,item["destination"]))
    skipped=[item for item in plan["planned_writes"] if item not in writes]
    targets={item["destination"]:item["target_snapshot"] for item in writes}; target_parent_snapshots={item["destination"]:item["target_parent_snapshot"] for item in writes}; staged_snapshots={}; target_parents={}; created=[]; published=[]; displaced=[]
    receipt_relative=plan["receipt_relative"]; receipt_target=_safe_target(root,receipt_relative)
    receipt_already_complete=bool(plan.get("bootstrap_writes")) and (plan["receipt_snapshot"] is not None or os.path.lexists(receipt_target)) and _update_installation_complete(root,plan["planned_writes"],receipt_relative,plan["completion_receipt"])
    if (plan["receipt_snapshot"] is not None or os.path.lexists(receipt_target)) and not receipt_already_complete: raise AdoptionRefused("update completion receipt already exists but installation is incomplete")
    published_names=[item["destination"] for item in writes]
    receipt=plan["completion_receipt"]
    published_exclude=None
    exclude_path=Path(plan["local_exclude_path"])
    exclude_before=private_exclude_state(exclude_path)
    exclude_identity=list(exclude_before[1]) if exclude_before[1] is not None else None
    if hashlib.sha256(exclude_before[0]).hexdigest()!=plan["local_exclude_digest"] or exclude_identity!=plan["local_exclude_identity"]:
        raise AdoptionRefused("repository-local exclusion changed after update planning")
    try:
        if plan["local_exclude_changed"]:
            published_exclude=_publish_planned_update_exclusion(plan)
        _require_effective_private_exclusions(root,effective_personal_paths)
        for item in writes:
            destination=staged/item["destination"]; destination.parent.mkdir(parents=True,exist_ok=True)
            payload,mode=_require_update_source(source,item); destination.write_bytes(payload); os.chmod(destination,mode)
            staged_snapshots[item["destination"]]=_target_snapshot(staged,item["destination"])
        if not receipt_already_complete:
            staged_receipt=staged/receipt_relative; staged_receipt.parent.mkdir(parents=True,exist_ok=True); staged_receipt.write_text(json.dumps(receipt,indent=2)+"\n",encoding="utf-8"); os.chmod(staged_receipt,0o644)
            staged_snapshots[receipt_relative]=_target_snapshot(staged,receipt_relative)
        _revalidate_skipped_update_targets(root,source,skipped)
        for index,item in enumerate(writes,1):
            relative=item["destination"]; destination=_safe_target(root,relative); expected=targets[relative]
            if relative==version_destination: _revalidate_skipped_update_targets(root,source,skipped)
            with _attached_parent(root,relative,target_parent_snapshots[relative],create_missing=True,created=created,creation_directory=parent_pool_fd) as (_directory,parents):
                target_parents[relative]=parents
            if expected is not None:
                original=_require_target_snapshot(root,relative,expected); backup=backups/relative; backup.parent.mkdir(parents=True,exist_ok=True)
                displaced.append((relative,original))
                with _attached_parent(backups,relative) as (_directory,backup_parents): _move_attached(root,relative,target_parents[relative],backups,backup_parents,original)
                moved=_target_snapshot(backups,relative); displaced[-1]=(relative,moved)
                if not _same_owned_file(original,moved): raise AdoptionRefused(f"update target changed during displacement: {relative}")
            elif _attached_leaf_exists(root,relative,target_parents[relative]):
                raise AdoptionRefused(f"update target changed after planning: {relative}")
            staged_identity=staged_snapshots[relative]; _require_target_snapshot(staged,relative,staged_identity)
            published.append((relative,None,staged_identity))
            _move_attached(staged,relative,staged_identity[0],root,target_parents[relative],staged_identity)
            observed=_target_snapshot(root,relative); published[-1]=(relative,observed,staged_identity)
            if not _same_owned_file(staged_identity,observed) or observed[0]!=target_parents[relative]: raise AdoptionRefused(f"update target changed during publication: {relative}")
            if fail_after is not None and index>=fail_after: raise OSError("injected update publication failure")
        _revalidate_skipped_update_targets(root,source,skipped)
        if not _update_artifacts_match(root,plan["planned_writes"]): raise AdoptionRefused("update artifact contract is incomplete before completion publication")
        if not receipt_already_complete:
            if os.path.lexists(receipt_target): raise AdoptionRefused("update completion receipt appeared during publication")
            with _attached_parent(root,receipt_relative,plan["receipt_parent_snapshot"],create_missing=True,created=created,creation_directory=parent_pool_fd) as (_directory,parents):
                target_parents[receipt_relative]=parents
            receipt_identity=staged_snapshots[receipt_relative]; published.append((receipt_relative,None,receipt_identity)); _move_attached(staged,receipt_relative,receipt_identity[0],root,parents,receipt_identity)
            observed_receipt=_target_snapshot(root,receipt_relative); published[-1]=(receipt_relative,observed_receipt,receipt_identity)
            if not _same_owned_file(receipt_identity,observed_receipt) or observed_receipt[0]!=target_parents[receipt_relative]: raise AdoptionRefused("update receipt changed during publication")
        _revalidate_skipped_update_targets(root,source,skipped)
        if not _update_installation_complete(root,plan["planned_writes"],receipt_relative,receipt): raise AdoptionRefused("update completion contract changed during commit")
        expected_exclude=published_exclude[1] if published_exclude is not None else exclude_before
        if private_exclude_state(exclude_path)!=expected_exclude: raise AdoptionRefused("repository-local exclusion changed before update completion")
        _require_effective_private_exclusions(root,effective_personal_paths)
        for relative,identity,_staged_identity in published:
            if identity is None: raise AdoptionRefused("update publication journal is incomplete")
            _require_target_snapshot(root,relative,identity)
        for relative,identity in displaced: _require_target_snapshot(backups,relative,identity)
        removed=_untrack_application_state(root,plan["application_state_index_snapshot"],plan["application_state_index_digest"])
    except BaseException as exc:
        for relative,identity,staged_identity in reversed(published):
            try:
                current=_target_snapshot(root,relative)
                if not _same_owned_file(current,identity if identity is not None else staged_identity): continue
                _move_attached(root,relative,target_parents[relative],staged,staged_identity[0],current)
            except (OSError,AdoptionRefused):
                continue
        for relative,identity in reversed(displaced):
            try:
                current=_target_snapshot(backups,relative)
                if not _same_owned_file(current,identity): continue
                _move_attached(backups,relative,current[0],root,target_parents[relative],current)
            except (OSError,AdoptionRefused):
                continue
        _rollback_created_parents(created,parent_pool_fd)
        if (published_exclude is not None and not isinstance(exc,IndexPublicationUncertain)
                and private_before is not None
                and _private_state_inventory(root,effective_personal_paths)==private_before
                and _original_index_is_current(root,plan["application_state_index_digest"])):
            try:
                current=private_exclude_state(Path(plan["local_exclude_path"]))
                before,after=published_exclude
                if current==after: _publish_exclude(Path(plan["local_exclude_path"]),current,before[0])
            except (OSError,AdoptionRefused):
                pass
        _close_created_parents(created); _close_descriptor(parent_pool_fd)
        print(f"update failed; owned changes restored where safe; owner replacements and recovery staging preserved: {staging}",file=sys.stderr)
        raise
    _close_created_parents(created); _close_descriptor(parent_pool_fd)
    try:
        for directory in sorted((path for path in staging.rglob("*") if path.is_dir()),key=lambda path:len(path.parts),reverse=True): directory.rmdir()
        staging.rmdir()
    except OSError:
        plan["recovery_staging"]=str(staging)
        print(f"update published; original backups and recovery staging preserved for explicit cleanup: {staging}",file=sys.stderr)
    return {"plan":plan,"receipt":receipt,"receipt_path":str(receipt_target),"published":published_names,"untracked_application_state_paths":removed}

def main(argv: list[str]|None=None) -> int:
    parser=argparse.ArgumentParser(); commands=parser.add_subparsers(dest="command",required=True)
    for name in ("plan","apply","update-plan","update"):
        command=commands.add_parser(name); command.add_argument("--target",required=True); command.add_argument("--authorize",action="append",default=[]); command.add_argument("--distribution",choices=tuple(sorted(DISTRIBUTIONS))); command.add_argument("--private",action="store_true",help="deprecated alias for --distribution personal"); command.add_argument("--name"); command.add_argument("--slug"); command.add_argument("--feature-prefix"); command.add_argument("--source-template"); command.add_argument("--repository-kind",choices=("unclassified","code","content","mixed"))
    args=parser.parse_args(argv)
    try:
        authorized=parse_authorizations(args.authorize)
        if args.command in {"update-plan","update"}:
            if args.private or args.distribution is not None or any((args.name,args.slug,args.feature_prefix,args.repository_kind)): raise AdoptionRefused("update does not accept distribution or identity options")
            result=update_plan(args.target,args.source_template) if args.command=="update-plan" else apply_update(args.target,authorized,args.source_template)
        else:
            if args.private and args.distribution not in {None,"personal"}: raise AdoptionRefused("--private conflicts with --distribution shared")
            distribution="personal" if args.private else (args.distribution or "shared")
            if distribution=="personal":
                result=private_adoption_plan(args.target,authorized,args.name,args.slug,args.feature_prefix,args.source_template,args.repository_kind) if args.command=="plan" else apply_private_adoption(args.target,authorized,args.name,args.slug,args.feature_prefix,source_template=args.source_template,repository_kind=args.repository_kind)
            else:
                if any((args.name,args.slug,args.feature_prefix,args.source_template,args.repository_kind)): raise AdoptionRefused("identity, source-template, and repository-kind options require --distribution personal")
                result=public_adoption_plan(args.target,authorized,distribution) if args.command=="plan" else apply_public_adoption(args.target,authorized,distribution=distribution)
        print(json.dumps(result,indent=2)); return 0
    except AdoptionRefused as exc: print(str(exc),file=sys.stderr); return 65
    except (OSError,ValueError) as exc: print(f"adoption error: {exc}",file=sys.stderr); return 74

if __name__=="__main__": raise SystemExit(main())
