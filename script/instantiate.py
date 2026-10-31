#!/usr/bin/env python3
"""Instantiate this harness into a new repository without copying Git state."""
from __future__ import annotations
import argparse
import ctypes
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from harness.installation_packaging import validate_batch_packaging as shared_validate_batch_packaging
from harness.state_domains import PRIVATE_GIT_PATHS, private_git_exclusion_rules, private_git_exclusions_effective
EXCLUDED = {".git", "__pycache__", ".pytest_cache", ".hermes", "node_modules", "build", ".build", "dist", ".DS_Store"}
INSTALLATION_EXCLUDED_PATHS = {".github/workflows", "test", "bin/agent-batch", "script/batch.py", "harness/batch-policy.json", "harness/requests", "harness/reviews", ".agent-harness"}
TEXT_SUFFIXES = {"", ".md", ".json", ".py", ".sh", ".yml", ".yaml", ".txt", ".toml"}
SENSITIVE_COMPONENT = re.compile(r"(?:\.env(?:\..+)?|id_rsa|id_ed25519|\.netrc|\.npmrc|\.pypirc|credentials(?:\.json)?|client-secret\.json|private[_-]?key(?:\.pem)?|[^/]+\.p(?:12|fx))$",re.I)
SAFE_FIXTURE_SUFFIXES = (".example",".sample",".template")
PRIVATE_EXCLUDE_BEGIN = "# BEGIN repository-harness private adoption"
PRIVATE_EXCLUDE_END = "# END repository-harness private adoption"
INITIALIZATION_EXPECTED_PATHS = [
    ".specify/feature.json", "ARCHITECTURE.md", "PROGRESS.md", "docs/product/**",
    "docs/decisions/**", "docs/exec-plans/active/**", "docs/artifacts.json",
    "docs/generated/documentation-index.md", "feature_list.json", "harness/project.json",
    "specs/**",
]
INITIALIZATION_VERIFICATION = [
    "Product users, jobs, workflows, boundaries, and non-goals are recorded in the product contract.",
    "Application architecture boundaries and owners are recorded in ARCHITECTURE.md.",
    "Configured install and startup commands execute for the selected application stack.",
    "Application unit and end-to-end profiles exercise real journeys or remain explicitly unavailable.",
    "The first bounded product feature has a selected specification, plan, tasks, and acceptance journeys.",
    "All configured verification profiles pass and required independent review is resolved.",
]

def canonical_repository_path(relative: str) -> bool:
    """Accept a literal, normalized repository-relative path."""
    return (isinstance(relative,str) and bool(relative) and not relative.startswith("/")
            and "\\" not in relative and all(part not in {"", ".", ".."} for part in relative.split("/"))
            and not any(ord(character)<32 or ord(character)==127 or 0xD800<=ord(character)<=0xDFFF for character in relative))

def canonical_active_plan_path(relative: str) -> bool:
    """Accept one literal plan file directly inside the active-plan directory."""
    if not canonical_repository_path(relative): return False
    parts=relative.split("/")
    return len(parts)==4 and parts[:3]==["docs","exec-plans","active"] and parts[3].endswith(".md") and parts[3]!=".md"

def validate_batch_packaging(root: Path=ROOT) -> tuple | None:
    """Keep template-only batch development tooling out of installed payloads."""
    try: return shared_validate_batch_packaging(root)
    except ValueError as error: raise OSError(str(error)) from error

def read_local_application_state(root: Path,relative: str) -> tuple[tuple[int,int,int,int,int,int],str,bytes]:
    """Read one locally ignored seed file without following links or races."""
    descriptor=os.open(root/relative,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0))
    try:
        before=os.fstat(descriptor)
        if not stat.S_ISREG(before.st_mode) or before.st_size>16*1024*1024:
            raise OSError(f"local application state is not a bounded regular file: {relative}")
        identity=(before.st_dev,before.st_ino,before.st_mode,before.st_size,before.st_mtime_ns,before.st_ctime_ns)
        chunks=[]; digest=hashlib.sha256()
        while True:
            block=os.read(descriptor,1024*1024)
            if not block: break
            chunks.append(block); digest.update(block)
        after=os.fstat(descriptor)
        if identity!=(after.st_dev,after.st_ino,after.st_mode,after.st_size,after.st_mtime_ns,after.st_ctime_ns):
            raise OSError(f"local application state changed while reading: {relative}")
        return identity,digest.hexdigest(),b"".join(chunks)
    finally: os.close(descriptor)

def publish_distribution_exclusions(root: Path, distribution: str) -> None:
    """Keep all work state local; personal mode also hides harness assets."""
    exclude=root/".git/info/exclude"
    metadata=os.lstat(exclude)
    if not stat.S_ISREG(metadata.st_mode) or stat.S_ISLNK(metadata.st_mode):
        raise OSError("repository-local exclusion file is unsafe")
    existing=exclude.read_text(encoding="utf-8")
    begin=existing.find(PRIVATE_EXCLUDE_BEGIN); end=existing.find(PRIVATE_EXCLUDE_END)
    if (begin<0)!=(end<0) or (begin>=0 and end<begin):
        raise OSError("repository-local exclusion block is malformed")
    if begin>=0:
        end+=len(PRIVATE_EXCLUDE_END)
        if end<len(existing) and existing[end:end+1]=="\n": end+=1
        existing=existing[:begin].rstrip("\n")+existing[end:]
    rules={"/.agent-harness/",*private_git_exclusion_rules()}
    if distribution=="personal":
        manifest=json.loads((root/"harness/adoption-manifest.json").read_text(encoding="utf-8"))
        rules.update("/"+item["path"] for item in manifest["artifacts"])
    block="\n".join([PRIVATE_EXCLUDE_BEGIN,*sorted(rules),PRIVATE_EXCLUDE_END])+"\n"
    payload=((existing.rstrip("\n")+"\n\n") if existing.strip() else "")+block
    temporary=exclude.with_name("exclude.repository-harness-tmp")
    if temporary.exists() or temporary.is_symlink(): raise OSError("repository-local exclusion staging path is occupied")
    temporary.write_text(payload,encoding="utf-8")
    os.chmod(temporary,stat.S_IMODE(metadata.st_mode))
    os.replace(temporary,exclude)

def sensitive_source_path(relative: str) -> bool:
    """Recognize only high-confidence credential filenames, never arbitrary words."""
    parts=Path(relative).parts
    for index,part in enumerate(parts):
        if not SENSITIVE_COMPONENT.fullmatch(part): continue
        # A fixture exception applies only to the final filename, never an ancestor.
        if index==len(parts)-1 and part.lower().endswith(SAFE_FIXTURE_SUFFIXES): continue
        return True
    return False

def distribution_allowset(root: Path=ROOT) -> set[str]:
    """Snapshot Git's distributable paths once, using NUL-delimited names."""
    repository=subprocess.run(["git","rev-parse","--show-toplevel"],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True)
    repository_root=repository.stdout.decode(errors="surrogateescape") if isinstance(repository.stdout,bytes) else repository.stdout
    if repository.returncode!=0 or Path(repository_root.strip()).resolve()!=root.resolve():
        raise OSError("source repository must be the Git worktree root with a distributable Git inventory")
    listed=subprocess.run(["git","ls-files","-z","--cached","--others","--exclude-standard"],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
    if listed.returncode: raise OSError("source Git inventory could not be captured safely")
    paths=set()
    for raw in listed.stdout.split(b"\0"):
        if not raw: continue
        relative=os.fsdecode(raw)
        if not canonical_repository_path(relative):
            raise OSError("source Git inventory contains an unsafe path")
        paths.add(relative)
    return paths

def nonregular_ignore_state(root: Path=ROOT,root_fd: int | None=None,allowset: set[str] | None=None) -> dict[str,str]:
    """Batch-classify special entries found by descriptor-relative no-follow walk."""
    owned=root_fd is None
    if root_fd is None: root_fd=os.open(root,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
    allowset=distribution_allowset(root) if allowset is None else allowset
    tracked_directories={parent.as_posix() for path in allowset for parent in Path(path).parents if parent!=Path(".")}
    candidates=[]
    def classify(paths: list[str]) -> dict[str,str]:
        if any(any(0xD800<=ord(character)<=0xDFFF for character in path) for path in paths):
            raise OSError("source Git ignore classification contains an unsafe path")
        if not paths: return {}
        result=subprocess.run(["git","check-ignore","--stdin","-z","-v","--non-matching"],cwd=root,input=("\0".join(paths)+"\0").encode(),stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
        if result.returncode not in {0,1}: raise OSError("source Git ignore classification could not be captured safely")
        fields=result.stdout.split(b"\0"); state={}
        if len(fields)%4!=1: raise OSError("source Git ignore classification is malformed")
        for index in range(0,len(fields)-1,4):
            pattern=os.fsdecode(fields[index+2]); relative=os.fsdecode(fields[index+3])
            if relative not in paths or any(0xD800<=ord(character)<=0xDFFF for character in relative): raise OSError("source Git ignore classification is unsafe")
            state[relative]=pattern if pattern and not pattern.startswith("!") else ""
        if set(state)!=set(paths): raise OSError("source Git ignore classification is incomplete")
        return state
    def visit(directory_fd: int,relative: Path) -> None:
        entries=[]
        for name in os.listdir(directory_fd):
            child=relative/name if relative!=Path(".") else Path(name); child_key=child.as_posix()
            if name in EXCLUDED or child_key in INSTALLATION_EXCLUDED_PATHS: continue
            metadata=os.stat(name,dir_fd=directory_fd,follow_symlinks=False)
            entries.append((name,child,child_key,metadata))
        ignored=classify([child_key for _name,_child,child_key,metadata in entries if stat.S_ISDIR(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode)])
        for name,child,child_key,metadata in entries:
            if stat.S_ISDIR(metadata.st_mode):
                # A tracked descendant remains distributable even when a later ignore
                # rule matches its parent; otherwise do not touch ignored private trees.
                if ignored[child_key] and child_key not in tracked_directories: continue
                child_fd=os.open(name,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=directory_fd)
                try: visit(child_fd,child)
                finally: os.close(child_fd)
            elif not stat.S_ISREG(metadata.st_mode): candidates.append(child_key)
    try: visit(root_fd,Path("."))
    finally:
        if owned: os.close(root_fd)
    if not candidates: return {}
    return classify(candidates)

def distribution_snapshot(root: Path=ROOT) -> tuple[set[str],dict[str,str]]:
    allowset=distribution_allowset(root)
    return allowset,nonregular_ignore_state(root,allowset=allowset)

def tree_error(root: Path,label: str,manifest: dict[str,tuple[tuple[int,int,int,int,int],str]] | None = None) -> str | None:
    pending=[root]
    while pending:
        directory=pending.pop()
        relative_directory=directory.relative_to(root)
        with os.scandir(directory) as entries:
            for entry in entries:
                relative=relative_directory/entry.name
                if entry.name in EXCLUDED or relative_directory==Path("harness/attestations"): continue
                metadata=entry.stat(follow_symlinks=False)
                if stat.S_ISLNK(metadata.st_mode): return f"{label} repository symlink is not allowed: {relative.as_posix()}"
                if stat.S_ISDIR(metadata.st_mode): pending.append(Path(entry.path)); continue
                if not stat.S_ISREG(metadata.st_mode): return f"{label} repository nonregular entry is not allowed: {relative.as_posix()}"
                if manifest is not None:
                    descriptor=os.open(entry.path,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0))
                    try:
                        opened=os.fstat(descriptor); digest=hashlib.sha256()
                        if (opened.st_dev,opened.st_ino)!=(metadata.st_dev,metadata.st_ino): return f"{label} repository entry changed during inventory: {relative.as_posix()}"
                        while True:
                            block=os.read(descriptor,1024*1024)
                            if not block: break
                            digest.update(block)
                        closed=os.fstat(descriptor); identity=(opened.st_dev,opened.st_ino,opened.st_mode,opened.st_size,opened.st_mtime_ns)
                        if identity!=(closed.st_dev,closed.st_ino,closed.st_mode,closed.st_size,closed.st_mtime_ns): return f"{label} repository entry changed during inventory: {relative.as_posix()}"
                        manifest[relative.as_posix()]=(identity,digest.hexdigest())
                    finally: os.close(descriptor)
    return None

def copy_regular(source: str,destination: str,manifest: dict[str,tuple[tuple[int,int,int,int,int],str]]) -> str:
    relative=Path(source).relative_to(ROOT).as_posix()
    if relative not in manifest: raise OSError(f"source entry was not present in the validated inventory: {relative}")
    expected_identity,expected_digest=manifest[relative]
    flags=os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0)
    source_fd=os.open(source,flags)
    try:
        metadata=os.fstat(source_fd)
        identity=(metadata.st_dev,metadata.st_ino,metadata.st_mode,metadata.st_size,metadata.st_mtime_ns)
        if not stat.S_ISREG(metadata.st_mode) or identity!=expected_identity: raise OSError(f"source entry identity changed after inventory: {relative}")
        destination_fd=os.open(destination,os.O_WRONLY|os.O_CREAT|os.O_EXCL,metadata.st_mode&0o777)
        try:
            digest=hashlib.sha256()
            while True:
                block=os.read(source_fd,1024*1024)
                if not block: break
                digest.update(block)
                view=memoryview(block)
                while view: view=view[os.write(destination_fd,view):]
            os.fchmod(destination_fd,metadata.st_mode&0o777)
        finally: os.close(destination_fd)
        after=os.fstat(source_fd); after_identity=(after.st_dev,after.st_ino,after.st_mode,after.st_size,after.st_mtime_ns)
        if after_identity!=expected_identity or digest.hexdigest()!=expected_digest:
            raise OSError(f"source entry bytes changed after inventory: {relative}")
    finally: os.close(source_fd)
    return destination

def rename_noreplace(source_fd: int,source: str,destination_fd: int,destination: str) -> None:
    libc=ctypes.CDLL(None,use_errno=True); source_bytes=os.fsencode(source); destination_bytes=os.fsencode(destination)
    if sys.platform=="darwin" and hasattr(libc,"renameatx_np"):
        operation=libc.renameatx_np; operation.argtypes=[ctypes.c_int,ctypes.c_char_p,ctypes.c_int,ctypes.c_char_p,ctypes.c_uint]; operation.restype=ctypes.c_int; result=operation(source_fd,source_bytes,destination_fd,destination_bytes,0x00000004)
    elif hasattr(libc,"renameat2"):
        operation=libc.renameat2; operation.argtypes=[ctypes.c_int,ctypes.c_char_p,ctypes.c_int,ctypes.c_char_p,ctypes.c_uint]; operation.restype=ctypes.c_int; result=operation(source_fd,source_bytes,destination_fd,destination_bytes,0x00000001)
    else: raise OSError("atomic no-replace directory publication is unavailable")
    if result:
        code=ctypes.get_errno(); raise OSError(code,os.strerror(code),destination)

def descriptor_inventory(root_fd: int,allowset: set[str] | None=None,nonregular_state: dict[str,str] | None=None,certified_snapshot: tuple | None=None):
    """Inventory copy inputs and, when present, bind them to certified Git bytes."""
    allowset=distribution_allowset() if allowset is None else allowset
    nonregular_state=nonregular_ignore_state(root_fd=root_fd,allowset=allowset) if nonregular_state is None else nonregular_state
    certified={os.fsdecode(entry[0]):entry for entry in certified_snapshot[1]} if certified_snapshot is not None else None
    directories_needed={parent.as_posix() for path in allowset for parent in Path(path).parents if parent!=Path(".")}
    directories_needed|={parent.as_posix() for path,pattern in nonregular_state.items() if not pattern for parent in Path(path).parents if parent!=Path(".")}
    root_metadata=os.fstat(root_fd); directories={"":(root_metadata.st_dev,root_metadata.st_ino,root_metadata.st_mode)}; files={}; children={}
    def visit(directory_fd: int,relative: Path) -> None:
        key=relative.as_posix() if relative!=Path(".") else ""; names=[]
        if key in {"harness/attestations","docs/product"}: children[key]=[]; return
        for name in sorted(os.listdir(directory_fd)):
            if name in EXCLUDED: continue
            child=relative/name if relative!=Path(".") else Path(name); child_key=child.as_posix(); metadata=os.stat(name,dir_fd=directory_fd,follow_symlinks=False)
            if child_key in INSTALLATION_EXCLUDED_PATHS: continue
            if child_key not in allowset and child_key not in directories_needed:
                if child_key in nonregular_state and not nonregular_state[child_key]:
                    if stat.S_ISLNK(metadata.st_mode): raise OSError(f"source repository symlink is not allowed: {child_key}")
                    raise OSError(f"source repository nonregular entry is not allowed: {child_key}")
                continue
            if sensitive_source_path(child_key): raise OSError("source repository contains a sensitive credential path")
            if stat.S_ISLNK(metadata.st_mode): raise OSError(f"source repository symlink is not allowed: {child_key}")
            names.append(name)
            if stat.S_ISDIR(metadata.st_mode):
                child_fd=os.open(name,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=directory_fd)
                try:
                    opened=os.fstat(child_fd); identity=(opened.st_dev,opened.st_ino,opened.st_mode)
                    if identity!=(metadata.st_dev,metadata.st_ino,metadata.st_mode): raise OSError(f"source directory changed during inventory: {child_key}")
                    directories[child_key]=identity; visit(child_fd,child)
                finally: os.close(child_fd)
            elif stat.S_ISREG(metadata.st_mode):
                descriptor=os.open(name,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=directory_fd)
                try:
                    opened=os.fstat(descriptor); identity=(opened.st_dev,opened.st_ino,opened.st_mode,opened.st_size,opened.st_mtime_ns,opened.st_ctime_ns); digest=hashlib.sha256(); payload=[]
                    if identity[:2]!=(metadata.st_dev,metadata.st_ino): raise OSError(f"source file changed during inventory: {child_key}")
                    while True:
                        block=os.read(descriptor,1024*1024)
                        if not block: break
                        digest.update(block); payload.append(block)
                    closed=os.fstat(descriptor)
                    if identity!=(closed.st_dev,closed.st_ino,closed.st_mode,closed.st_size,closed.st_mtime_ns,closed.st_ctime_ns): raise OSError(f"source file changed during inventory: {child_key}")
                    digest_value=digest.hexdigest()
                    if certified is not None:
                        certified_entry=certified.get(child_key)
                        parts=Path(child_key).parts[:-1]; certified_parents=tuple(directories["/".join(parts[:index])] for index in range(1,len(parts)+1))
                        if certified_entry is None or certified_entry[1]!=directories[""] or certified_entry[2]!=certified_parents or certified_entry[3]!=identity or certified_entry[4]!=digest_value:
                            raise OSError(f"source file does not match the certified snapshot: {child_key}")
                    files[child_key]=(identity,digest_value,b"".join(payload) if child_key in {"harness/project.json","feature_list.json","docs/artifacts.json"} else None)
                finally: os.close(descriptor)
            else: raise OSError(f"source repository nonregular entry is not allowed: {child_key}")
        children[key]=names
    visit(root_fd,Path(".")); return directories,files,children

def copy_inventory(source_fd: int,destination_fd: int,relative: Path,directories,files,children) -> None:
    key=relative.as_posix() if relative!=Path(".") else ""; current=[]
    for name in sorted(os.listdir(source_fd)):
        child=relative/name if relative!=Path(".") else Path(name)
        if name not in EXCLUDED and child.as_posix() not in INSTALLATION_EXCLUDED_PATHS and child.as_posix() in directories|files: current.append(name)
    if key in {"harness/attestations","docs/product"}: current=[]
    if current!=children[key]: raise OSError(f"source directory entries changed after inventory: {key or '.'}")
    for name in children[key]:
        child=relative/name if relative!=Path(".") else Path(name); child_key=child.as_posix(); metadata=os.stat(name,dir_fd=source_fd,follow_symlinks=False)
        if child_key in directories:
            child_source=os.open(name,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=source_fd)
            try:
                opened=os.fstat(child_source)
                if (opened.st_dev,opened.st_ino,opened.st_mode)!=directories[child_key]: raise OSError(f"source directory identity changed after inventory: {child_key}")
                os.mkdir(name,stat.S_IMODE(opened.st_mode),dir_fd=destination_fd); child_destination=os.open(name,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0),dir_fd=destination_fd)
                try: copy_inventory(child_source,child_destination,child,directories,files,children)
                finally: os.close(child_destination)
            finally: os.close(child_source)
        else:
            expected_identity,expected_digest,_payload=files[child_key]; descriptor=os.open(name,os.O_RDONLY|getattr(os,"O_NOFOLLOW",0)|getattr(os,"O_NONBLOCK",0),dir_fd=source_fd)
            try:
                opened=os.fstat(descriptor); identity=(opened.st_dev,opened.st_ino,opened.st_mode,opened.st_size,opened.st_mtime_ns,opened.st_ctime_ns)
                if identity!=expected_identity: raise OSError(f"source file identity changed after inventory: {child_key}")
                target=os.open(name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_NOFOLLOW",0),stat.S_IMODE(opened.st_mode),dir_fd=destination_fd); digest=hashlib.sha256()
                try:
                    while True:
                        block=os.read(descriptor,1024*1024)
                        if not block: break
                        digest.update(block); view=memoryview(block)
                        while view: view=view[os.write(target,view):]
                    os.fchmod(target,stat.S_IMODE(opened.st_mode))
                finally: os.close(target)
                closed=os.fstat(descriptor)
                if identity!=(closed.st_dev,closed.st_ino,closed.st_mode,closed.st_size,closed.st_mtime_ns,closed.st_ctime_ns) or digest.hexdigest()!=expected_digest: raise OSError(f"source file bytes changed after inventory: {child_key}")
            finally: os.close(descriptor)

def write_initialization_spec(workspace: Path,name: str,slug: str,feature_id: str) -> list[str]:
    specs=workspace/"specs"
    if specs.exists(): shutil.rmtree(specs)
    feature=specs/"001-repository-initialization"; checklist=feature/"checklists"; checklist.mkdir(parents=True)
    (feature/"spec.md").write_text(f"""# Feature Specification: Initialize {name}

**Status**: Draft

## User Scenario

The repository owner and coding agents can discover the product authority, architecture boundaries, initialization command, verification profiles, and first bounded feature entirely from repository files.

## Requirements

- The repository MUST replace placeholder product and architecture authority before application readiness is claimed.
- The repository MUST configure real install, startup, unit, and end-to-end verification for its selected stack.
- Agents MUST use the installed Spec Kit workflow for feature specification, planning, and tasks.
- Feature execution state MUST remain authoritative in `feature_list.json`.

## Success Criteria

- A fresh agent can answer the five recovery questions without conversation history.
- Configured base verification passes and unavailable application gates remain explicit.
- The first product feature has approved specification, plan, tasks, and acceptance journeys.

## Assumptions

- Product discovery and application architecture are intentionally unset at repository creation.
- The active harness work item is `{feature_id}` and the repository slug is `{slug}`.
""",encoding="utf-8")
    (feature/"plan.md").write_text(f"""# Implementation Plan: Initialize {name}

1. Discover and approve the product contract.
2. Select and record application architecture.
3. Configure install and startup/readiness commands.
4. Configure application unit and end-to-end profiles.
5. Specify and plan the first bounded product feature.
6. Run repository verification and independent review.
""",encoding="utf-8")
    (feature/"tasks.md").write_text("""# Tasks: Repository Initialization

- [ ] T001 Define users, jobs, boundaries, and non-goals in `docs/product/product-contract.md`
- [ ] T002 Record application boundaries and ownership in `ARCHITECTURE.md`
- [ ] T003 Configure install and startup commands in `harness/project.json`
- [ ] T004 Configure application unit and end-to-end profiles in `harness/project.json`
- [ ] T005 Create the first bounded product feature with the installed Spec Kit workflow
- [ ] T006 Run all configured verification and resolve independent review
""",encoding="utf-8")
    (checklist/"requirements.md").write_text("""# Repository Initialization Checklist

- [ ] Product authority is specific and approved
- [ ] Architecture boundaries and owners are recorded
- [ ] Install and startup/readiness commands execute successfully
- [ ] Application unit and end-to-end journeys are configured
- [ ] The first product feature has a validated specification, plan, and tasks
""",encoding="utf-8")
    (workspace/".specify/feature.json").write_text(json.dumps({"feature_directory":"specs/001-repository-initialization"},indent=2)+"\n",encoding="utf-8")
    return [
        "specs/001-repository-initialization/checklists/requirements.md",
        "specs/001-repository-initialization/plan.md",
        "specs/001-repository-initialization/spec.md",
        "specs/001-repository-initialization/tasks.md",
    ]

def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument("destination",type=Path)
    parser.add_argument("name")
    parser.add_argument("slug")
    parser.add_argument("--feature-prefix")
    parser.add_argument("--repository-kind",choices=("unclassified","code","content","mixed"),default="unclassified")
    parser.add_argument("--distribution",choices=("shared","personal"),default="shared")
    args=parser.parse_args()
    requested_destination=args.destination.expanduser().resolve()
    if requested_destination.exists():
        print(f"destination already exists: {requested_destination}",file=sys.stderr); return 65
    if not requested_destination.parent.is_dir():
        print(f"destination parent does not exist: {requested_destination.parent}",file=sys.stderr); return 65
    if not re.fullmatch(r"[a-z][a-z0-9-]*",args.slug):
        print("slug must match [a-z][a-z0-9-]*",file=sys.stderr); return 64
    try:
        source_binding=validate_batch_packaging(ROOT)
        allowset,nonregular_state=distribution_snapshot(ROOT)
    except OSError as error:
        print(str(error),file=sys.stderr); return 65
    source_fd=os.open(ROOT,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
    try: directories,files,children=descriptor_inventory(source_fd,allowset,nonregular_state,source_binding[0] if source_binding is not None else None)
    except OSError as error:
        os.close(source_fd); print(str(error),file=sys.stderr); return 65
    local_state_seeds={}
    try:
        if "feature_list.json" in files:
            source_feature_bytes=files["feature_list.json"][2]
        else:
            local_state_seeds["feature_list.json"]=read_local_application_state(ROOT,"feature_list.json")
            source_feature_bytes=local_state_seeds["feature_list.json"][2]
        if "docs/artifacts.json" in files:
            source_artifacts_bytes=files["docs/artifacts.json"][2]
        else:
            local_state_seeds["docs/artifacts.json"]=read_local_application_state(ROOT,"docs/artifacts.json")
            source_artifacts_bytes=local_state_seeds["docs/artifacts.json"][2]
        source_features=json.loads(source_feature_bytes.decode("utf-8"))
        source_artifacts=json.loads(source_artifacts_bytes.decode("utf-8"))
    except (OSError,UnicodeError,json.JSONDecodeError) as error:
        os.close(source_fd); print(f"source application feature state is unavailable: {error}",file=sys.stderr); return 65
    prefix=args.feature_prefix or re.sub(r"[^A-Z0-9]","",args.slug.upper())[:16] or "APP"
    source_project=json.loads(files["harness/project.json"][2].decode("utf-8"))
    active=[item for item in source_features.get("features",[]) if item.get("status")=="in_progress"]
    if len(active)>1:
        os.close(source_fd); print("source repository must have at most one in_progress feature",file=sys.stderr); return 65
    if active:
        source_item=active[0]
    else:
        candidates=source_features.get("features",[])
        if not candidates:
            os.close(source_fd); print("source repository must define an initialization feature template",file=sys.stderr); return 65
        # A released template may have no active work. Reuse one feature's
        # validated shape as a seed, then replace its execution state below.
        source_item=dict(candidates[0])
        source_item.update({"id":f"{prefix}-001","status":"in_progress","evidence":[],"blocker":None})
    destination=Path(tempfile.mkdtemp(prefix=f".{requested_destination.name}.instantiate-",dir=requested_destination.parent)); staging_metadata=destination.stat(); staging_identity=(staging_metadata.st_dev,staging_metadata.st_ino)
    destination_fd=os.open(destination,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_NOFOLLOW",0))
    try: copy_inventory(source_fd,destination_fd,Path("."),directories,files,children)
    except OSError as error:
        print(f"source repository changed during safe copy: {error}; staging preserved for manual recovery: {destination}",file=sys.stderr); return 65
    finally: os.close(source_fd)
    if "feature_list.json" not in files:
        (destination/"feature_list.json").write_bytes(source_feature_bytes)
    if "docs/artifacts.json" not in files:
        artifact_seed=destination/"docs/artifacts.json"; artifact_seed.parent.mkdir(parents=True,exist_ok=True); artifact_seed.write_bytes(source_artifacts_bytes)
    if local_state_seeds:
        try:
            for relative,expected in local_state_seeds.items():
                if read_local_application_state(ROOT,relative)[:2]!=expected[:2]: raise OSError(f"source application state changed during safe copy: {relative}")
        except OSError as error:
            print(f"source application feature state changed during safe copy; staging preserved for manual recovery: {destination}: {error}",file=sys.stderr); return 65
    try:
        if distribution_snapshot(ROOT)!=(allowset,nonregular_state): raise OSError("source Git inventory changed during safe copy")
    except OSError:
        print(f"source Git inventory changed during safe copy; staging preserved for manual recovery: {destination}",file=sys.stderr); return 65
    os.fchdir(destination_fd); workspace=Path(".")
    unsafe_destination=tree_error(workspace,"instantiated")
    if unsafe_destination:
        print(unsafe_destination,file=sys.stderr); return 65
    replacements={source_item["id"]:f"{prefix}-001"} if active else {}
    for term in sorted(set(source_project.get("identity_terms",[])+[source_project["name"],source_project["slug"]]),key=len,reverse=True): replacements[term]=args.slug if term==source_project["slug"] else args.name
    for path in workspace.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES: continue
        try: text=path.read_text(encoding="utf-8")
        except UnicodeError: continue
        for old,new in replacements.items(): text=text.replace(old,new)
        path.write_text(text,encoding="utf-8")
    project_path=workspace/"harness/project.json"; instantiated_project=json.loads(project_path.read_text()); instantiated_project["name"]=args.name; instantiated_project["slug"]=args.slug
    instantiated_project["identity_terms"]=list(dict.fromkeys([args.name,args.slug]+([args.name.split()[0]] if len(args.name.split()[0])>=5 else [])))
    instantiated_project["run_meta_tests"]=False
    instantiated_project["installation"]={"schema":1,"distribution":args.distribution}
    instantiated_project["profiles"]["harness"]={"layer":"behavioral","commands":[],"unavailable":"Template harness self-tests are not installed in application repositories."}
    instantiated_project["classification"]={"repository_kind":args.repository_kind,"allowed_work_kinds":{"unclassified":[],"code":["code","content"],"content":["content"],"mixed":["code","content"]}[args.repository_kind]}
    project_path.write_text(json.dumps(instantiated_project,indent=2)+"\n")
    distribution_path=workspace/"harness/distribution.json"
    distribution_path.write_text(json.dumps({"schema":1,"distribution":args.distribution},indent=2)+"\n",encoding="utf-8")
    try: validate_batch_packaging(workspace)
    except OSError as error:
        print(str(error),file=sys.stderr); return 65
    feature_path=workspace/"feature_list.json"
    feature=json.loads(feature_path.read_text())
    active_items=[candidate for candidate in feature["features"] if candidate.get("status")=="in_progress"]
    if active:
        if len(active_items)!=1:
            print("instantiated repository must contain exactly one active feature",file=sys.stderr); return 65
        item=active_items[0]
    else:
        item=source_item
    feature["features"]=[item]
    if feature.get("schema")==2:
        feature["request"]=None
    item.pop("task_ids",None)
    item["status"]="in_progress"; item["evidence"]=[]; item["blocker"]=None
    item.pop("human_acceptance",None)
    item["spec_directory"]="specs/001-repository-initialization"
    item["depends_on"]=[]
    item["required_profiles"]=[profile for profile in item["required_profiles"] if profile!="harness"]
    item["work_kind"]={"unclassified":"unclassified","code":"code","content":"content","mixed":"code"}[args.repository_kind]
    item["risk"]="standard"
    item["security_sensitive"]=False
    item["title"]="Initialize the repository harness and define the first product plan"
    item["user_visible_behavior"]="A fresh agent can understand, initialize, verify, and plan this repository using repository artifacts only."
    item["next_action"]="Replace product and architecture placeholders, configure real application verification profiles, and define the first bounded user-visible feature."
    item["external_gates"]=["independent-review"]
    item["expected_paths"]=INITIALIZATION_EXPECTED_PATHS
    item["verification"]=INITIALIZATION_VERIFICATION
    feature_path.write_text(json.dumps(feature,indent=2)+"\n")
    initialization_documents=write_initialization_spec(workspace,args.name,args.slug,item["id"])
    (workspace/"harness/outcomes.json").write_text('{\n  "schema": 1,\n  "entries": []\n}\n')
    # Measurements are local runtime state, but generated docs require the
    # store to exist before the first measurement has been recorded.
    (workspace/"harness/measurements.json").write_text('{\n  "schema": 1,\n  "entries": []\n}\n',encoding="utf-8")
    # v2 keeps harness-maintenance state out of the application's root ledger.
    # The root feature list/progress/specs above remain application-owned.
    harness_state = workspace/".agent-harness"
    (harness_state/"specs").mkdir(parents=True, exist_ok=True)
    (harness_state/"feature_list.json").write_text('{\n  "schema": 1,\n  "features": []\n}\n', encoding="utf-8")
    (harness_state/"PROGRESS.md").write_text("# Harness Maintenance Progress\n\n- Harness state domain initialized for v2.0.0.\n- Application repository state remains authoritative at the repository root.\n", encoding="utf-8")
    (harness_state/"state-domain.json").write_bytes((workspace/"harness/state-domain.json").read_bytes())
    quality=workspace/"docs/agent/harness-quality.md"
    quality.write_text("# Harness Quality Baseline\n\nStatus: unmeasured for this repository instantiation.\n\nRun the repository-owned verification, doctor, session, and application profiles before recording repository-specific counts, timings, handoff results, or quality claims. Template measurements are intentionally not inherited.\n")
    plans=list((workspace/"docs/exec-plans/active").glob("*.md"))
    if len(plans)==1:
        old_plan=plans[0]; old_relative=old_plan.relative_to(workspace).as_posix(); old_plan_name=old_plan.name; new_plan=old_plan.with_name(f"2026-07-30-{args.slug}-initialization.md"); old_plan.rename(new_plan)
    elif not plans:
        active_plan_paths=[entry.get("path") for entry in source_artifacts.get("documents",[]) if isinstance(entry,dict) and isinstance(entry.get("path"),str) and entry["path"].startswith("docs/exec-plans/active/") and entry["path"].endswith(".md")]
        if len(active_plan_paths)!=1 or not canonical_active_plan_path(active_plan_paths[0]):
            print("instantiated repository must contain exactly one canonical active plan",file=sys.stderr); return 65
        old_relative=active_plan_paths[0]; old_plan_name=Path(old_relative).name
        plan_directory=workspace
        for component in ("docs","exec-plans","active"):
            plan_directory=plan_directory/component
            if plan_directory.is_symlink() or (plan_directory.exists() and not plan_directory.is_dir()):
                print("active plan directory is unsafe",file=sys.stderr); return 65
            plan_directory.mkdir(exist_ok=True)
        new_plan=plan_directory/f"2026-07-30-{args.slug}-initialization.md"
    else:
        print("instantiated repository must contain exactly one active plan",file=sys.stderr); return 65
    (workspace/"README.md").write_text(f"# {args.name}\n\nRepository-owned harness and product-discovery workspace. Start with `./init.sh`, `AGENTS.md`, and `docs/product/product-contract.md`. Application verification remains unavailable until real commands and journeys are configured.\n")
    (workspace/"ARCHITECTURE.md").write_text(f"# {args.name} Architecture\n\nNo application architecture has been selected. Record boundaries and decisions here only after product discovery and executable validation. Harness code under `script/` must remain separate from future application code.\n")
    (workspace/"PROGRESS.md").write_text(f"# {args.name} Progress\n\n- Repository harness instantiated.\n- Product behavior, application stack, unit profile, startup readiness, and end-to-end journey remain unconfigured.\n")
    product=workspace/"docs/product"; (product/"oversight").mkdir(parents=True,exist_ok=True)
    (product/"README.md").write_text("# Product authority\n\n`product-contract.md` is the current bounded product authority. Update it through reviewed discovery rather than inheriting claims from a predecessor repository.\n")
    (product/"product-contract.md").write_text(f"# {args.name} Product Contract\n\nStatus: discovery required\n\nDefine users, jobs, workflows, boundaries, acceptance journeys, and explicit non-goals here. No predecessor product behavior or measurement is inherited.\n")
    (product/"oversight/change-log.md").write_text(f"# Product Oversight Change Log\n\n- 2026-07-30: Initialized an empty product authority for {args.name}; no predecessor claims were retained.\n")
    new_plan.write_text(f"# {args.name} Repository Initialization\n\nStatus: active\n\n1. Discover and approve the product contract.\n2. Select and record application architecture.\n3. Configure real install and startup/readiness argv.\n4. Configure application unit and end-to-end profiles with executable journeys.\n5. Run repository verification and independent review without inheriting predecessor measurements.\n")
    registry_path=workspace/"docs/artifacts.json"; registry=json.loads(registry_path.read_text())
    new_relative=new_plan.relative_to(workspace).as_posix()
    for document in registry["documents"]:
        if document["path"]==old_relative: document["path"]=new_relative
    registry["documents"]=[document for document in registry["documents"] if not document["path"].startswith("specs/")]
    registry["documents"].extend({"path":path,"owner":"repository maintainers","status":"current","last_reviewed":"2026-08-15"} for path in initialization_documents)
    registry["documents"].sort(key=lambda entry:entry["path"])
    registry_path.write_text(json.dumps(registry,indent=2)+"\n")
    for markdown in workspace.rglob("*.md"):
        text=markdown.read_text(); updated=text.replace(old_plan_name,new_plan.name)
        if updated!=text: markdown.write_text(updated)
    subprocess.run(["git","init"],cwd=workspace,pass_fds=(destination_fd,),check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    publish_distribution_exclusions(workspace,args.distribution)
    personal_paths=tuple(item["path"] for item in json.loads((workspace/"harness/adoption-manifest.json").read_text())["artifacts"]) if args.distribution=="personal" else ()
    if not private_git_exclusions_effective(workspace,personal_paths):
        print("generated repository ignore rules override required private feature-state exclusions",file=sys.stderr)
        return 65
    # Generated application state is intentionally ignored by Git, but the
    # documentation checker resolves links before it writes generated files.
    # Seed the two registered generated views so first generation can run.
    (workspace/"docs/generated/documentation-index.md").parent.mkdir(parents=True,exist_ok=True)
    (workspace/"docs/generated/documentation-index.md").write_text("# Documentation Index\n",encoding="utf-8")
    (workspace/"docs/agent/fresh-session-checklist.md").write_text("# Fresh Session Checklist\n",encoding="utf-8")
    recovery=workspace/"harness/recovery-questions.json"
    if not recovery.exists():
        recovery.write_bytes((ROOT/"harness/recovery-questions.json").read_bytes())
    try:
        subprocess.run([sys.executable,"-B","script/harness.py","generate-docs"],cwd=workspace,pass_fds=(destination_fd,),check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as error:
        detail=error.stderr.decode("utf-8",errors="replace") if isinstance(error.stderr,bytes) else error.stderr
        print(f"instantiated documentation generation failed: {detail or error}",file=sys.stderr)
        return 65
    # A shared clone needs only immutable starter files; live feature progress
    # stays outside Git and is never copied back into this seed.
    starter_files={}
    for relative in PRIVATE_GIT_PATHS if args.distribution=="shared" else ():
        state_path=workspace/relative
        candidates=sorted(path for path in state_path.rglob("*") if path.is_file()) if state_path.is_dir() else [state_path] if state_path.is_file() else []
        for candidate in candidates:
            if candidate.is_symlink():
                print("generated private starter state contains a symlink",file=sys.stderr)
                return 65
            starter_files[candidate.relative_to(workspace).as_posix()]=candidate.read_text(encoding="utf-8")
    (workspace/"harness/local-state-seed.json").write_text(json.dumps({"schema":1,"files":starter_files},indent=2,sort_keys=True)+"\n",encoding="utf-8")
    parent_fd=os.open(requested_destination.parent,os.O_RDONLY|getattr(os,"O_DIRECTORY",0))
    try:
        if distribution_snapshot(ROOT)!=(allowset,nonregular_state): raise OSError("source Git inventory changed before publication")
        for relative,expected in local_state_seeds.items():
            if read_local_application_state(ROOT,relative)[:2]!=expected[:2]: raise OSError(f"source application state changed before installation publication: {relative}")
        if validate_batch_packaging(ROOT)!=source_binding:
            raise OSError("certified source changed before installation publication")
        metadata=os.fstat(destination_fd); visible=os.stat(destination.name,dir_fd=parent_fd,follow_symlinks=False)
        if (metadata.st_dev,metadata.st_ino)!=staging_identity: raise OSError("invocation-owned staging directory was replaced")
        if (visible.st_dev,visible.st_ino)!=staging_identity: raise OSError("invocation-owned staging pathname was replaced")
        rename_noreplace(parent_fd,destination.name,parent_fd,requested_destination.name)
        published=os.stat(requested_destination.name,dir_fd=parent_fd,follow_symlinks=False)
        if (published.st_dev,published.st_ino)!=staging_identity: raise OSError("published repository is not the invocation-owned staging directory")
        os.fsync(parent_fd)
    except OSError as error:
        print(f"could not publish instantiated repository without replacement: {error}; staging preserved for manual recovery: {destination}",file=sys.stderr); return 65
    finally:
        os.close(destination_fd)
        os.close(parent_fd)
    print(requested_destination)
    return 0

if __name__=="__main__": raise SystemExit(main())
