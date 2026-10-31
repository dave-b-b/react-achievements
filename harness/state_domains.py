"""Fixed, fail-closed ownership and path resolution for harness state."""
from pathlib import Path, PurePosixPath
import re
import subprocess


class StateDomainError(ValueError):
    pass


DOMAINS = {"application": ".", "harness": ".agent-harness"}
OWNED_PATHS = (
    "feature_list.json", "PROGRESS.md", ".specify/feature.json", "specs",
    "docs/artifacts.json", "harness/outcomes.json",
    "harness/recovery-questions.json", "docs/exec-plans", "docs/generated/documentation-index.md",
    "docs/agent/fresh-session-checklist.md", "harness/reviews",
    "harness/attestations", "harness/requests",
)
PRIVATE_GIT_PATHS = (".agent-harness", *OWNED_PATHS, "harness/measurements.json")
PRIVATE_GIT_DIRECTORIES = frozenset({".agent-harness", "specs", "docs/exec-plans", "harness/reviews", "harness/attestations", "harness/requests"})


def private_git_exclusion_rules() -> tuple[str, ...]:
    """Repository-root-relative Git excludes for mutable application state."""
    return tuple("/" + path + ("/" if path in PRIVATE_GIT_DIRECTORIES else "") for path in PRIVATE_GIT_PATHS)


def private_git_exclusions_effective(repository_root: str | Path, additional_paths: tuple[str, ...] = ()) -> bool:
    """Check Git's actual ignore decision, including owner .gitignore overrides."""
    probes = []
    for path in PRIVATE_GIT_PATHS:
        if path in PRIVATE_GIT_DIRECTORIES:
            probes.extend((path + "/", path + "/__harness_private_probe__"))
        else:
            probes.append(path)
    probes.extend(additional_paths)
    # Specific nested exceptions can evade a directory probe. Check actual
    # tracked paths awaiting removal and exposed untracked paths as well.
    existing = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", *PRIVATE_GIT_PATHS],
        cwd=repository_root, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
    )
    if existing.returncode != 0 or (existing.stdout and not existing.stdout.endswith(b"\0")):
        return False
    encoded = {path.encode("utf-8") for path in probes}
    encoded.update(path for path in existing.stdout.split(b"\0") if path)
    payload = b"\0".join(sorted(encoded)) + b"\0"
    result = subprocess.run(
        ["git", "check-ignore", "--no-index", "-z", "--stdin"],
        cwd=repository_root, input=payload, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
    )
    if result.returncode not in (0, 1) or (result.stdout and not result.stdout.endswith(b"\0")):
        return False
    return {path for path in result.stdout.split(b"\0") if path} == encoded


def is_private_git_path(relative: str) -> bool:
    """Whether a repository-relative path is private application or harness state."""
    if isinstance(relative, str) and (relative == ".agent-harness" or relative.startswith(".agent-harness/")):
        return True
    if isinstance(relative, str) and any(relative == directory or relative.startswith(directory + "/") for directory in PRIVATE_GIT_DIRECTORIES):
        return True
    if isinstance(relative, str) and relative in PRIVATE_GIT_PATHS:
        return True
    try:
        return is_owned_path(relative)
    except StateDomainError:
        # Arbitrary application paths can contain glob metacharacters. They are
        # not invalid Git paths merely because the state-domain API rejects them.
        return False
_GLOB = re.compile(r"[*?\[\]]")


def safe_relative(value: str) -> PurePosixPath:
    if (not isinstance(value, str) or not value or "\\" in value or "\x00" in value
            or value.startswith("/") or _GLOB.search(value)):
        raise StateDomainError("state path must be a canonical relative POSIX path")
    parts = value.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise StateDomainError("state path escapes or aliases its domain")
    return PurePosixPath(*parts)


def retained_personal_artifact_paths(repository_root: str | Path, artifacts: list[dict]) -> tuple[str, ...]:
    """Resolve root-owned personal artifacts independent of mutable exclusions."""
    root = Path(repository_root)
    transformed = {
        "AGENTS.md": "AGENTS.override.md",
        "README.md": "README.harness.md",
        "ARCHITECTURE.md": "ARCHITECTURE.harness.md",
        ".gitignore": "AGENTS.override.md",
    }
    indexed = subprocess.run(["git", "--literal-pathspecs", "ls-files", "--cached", "-z", "--", *transformed],
                             cwd=root, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    head = subprocess.run(["git", "rev-parse", "--verify", "HEAD"],cwd=root,
                          stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    committed = (subprocess.run(["git", "--literal-pathspecs", "ls-tree", "-z", "--name-only", "HEAD", "--", *transformed],
                                cwd=root, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
                 if head.returncode==0 else None)
    if (indexed.returncode or (committed is not None and committed.returncode)
            or any(value and not value.endswith(b"\0") for value in (indexed.stdout, committed.stdout if committed else b""))):
        raise StateDomainError("personal artifact ownership cannot be checked")
    indexed_paths = {value.decode("utf-8", "surrogateescape") for value in indexed.stdout.split(b"\0") if value}
    committed_paths = {value.decode("utf-8", "surrogateescape") for value in committed.stdout.split(b"\0") if value} if committed else set()
    owner_paths = indexed_paths & committed_paths
    paths = set()
    for artifact in artifacts:
        if not isinstance(artifact, dict):
            raise StateDomainError("personal artifact inventory is invalid")
        path = safe_relative(artifact.get("path")).as_posix()
        alternate = transformed.get(path)
        # Older manifests predate brownfield filename transforms. An
        # alternate alone is mutable owner data. The root file must have
        # belonged to the repository before the current staged work too.
        if alternate is not None and path in owner_paths and (root / alternate).is_file():
            paths.add(alternate)
            continue
        paths.add(path)
    return tuple(sorted(paths))


def legacy_personal_rule_paths(rules: set[str]) -> tuple[str, ...]:
    """Keep existing explicit legacy rules in effective-ignore validation."""
    paths=set()
    for rule in rules:
        if not isinstance(rule,str) or not rule.startswith("/") or rule.endswith("/"):
            continue
        try: path=safe_relative(rule[1:]).as_posix()
        except StateDomainError: continue
        if not is_private_git_path(path): paths.add(path)
    return tuple(sorted(paths))


def is_owned_path(relative: str) -> bool:
    """Whether a canonical Git path names one of the fixed state artifacts."""
    path = safe_relative(relative).as_posix()
    return any(path == item or path.startswith(item + "/") for item in OWNED_PATHS)


def map_path(domain: str, relative: str) -> str:
    """Map one logical state path; shared and canonical paths stay literal."""
    if domain not in DOMAINS:
        raise StateDomainError(f"unknown state domain: {domain}")
    path=safe_relative(relative).as_posix()
    if domain=="harness":
        if path.startswith(".agent-harness/") or path==".agent-harness":
            return path
        if is_owned_path(path): return f".agent-harness/{path}"
    elif path==".agent-harness" or path.startswith(".agent-harness/"):
        raise StateDomainError("application state cannot access harness-owned paths")
    return path


def _has_symlink(path: Path, stop: Path) -> bool:
    current = stop
    try:
        relative = path.relative_to(stop)
    except ValueError as exc:
        raise StateDomainError("state path is outside its domain") from exc
    for part in relative.parts:
        current = current / part
        try:
            if current.is_symlink():
                return True
        except OSError as exc:
            raise StateDomainError("state path cannot be inspected safely") from exc
    return False


def resolve(domain: str, relative: str, repository_root: str | Path) -> Path:
    if domain not in DOMAINS:
        raise StateDomainError(f"unknown state domain: {domain}")
    path = safe_relative(relative)
    if domain == "harness" and (path.parts[0] == ".agent-harness"):
        raise StateDomainError("harness state paths are domain-relative")
    if domain == "application" and path.parts[0] == ".agent-harness":
        raise StateDomainError("application state cannot resolve harness-owned paths")
    root = Path(repository_root).absolute()
    if root.is_symlink():
        raise StateDomainError("repository root cannot be a symlink")
    domain_root = root if domain == "application" else root / DOMAINS[domain]
    if domain == "harness":
        if not domain_root.is_dir() or domain_root.is_symlink():
            raise StateDomainError("harness state domain is not initialized")
    if _has_symlink(domain_root / path, domain_root):
        raise StateDomainError("state path cannot traverse a symlink")
    resolved = domain_root / path
    try:
        resolved.relative_to(domain_root)
    except ValueError as exc:
        raise StateDomainError("state path resolves outside its domain") from exc
    return resolved


def owner(domain: str, relative: str) -> str:
    """Return the canonical Git path for a domain-relative state path."""
    path = safe_relative(relative)
    if domain not in DOMAINS:
        raise StateDomainError(f"unknown state domain: {domain}")
    if domain == "harness" and path.parts[0] == ".agent-harness":
        raise StateDomainError("harness state paths are domain-relative")
    if domain == "application" and path.parts[0] == ".agent-harness":
        raise StateDomainError("application state cannot own harness paths")
    if not is_owned_path(path.as_posix()):
        raise StateDomainError("path is not in the fixed domain-owned state inventory")
    prefix = DOMAINS[domain]
    return path.as_posix() if prefix == "." else f"{prefix}/{path.as_posix()}"


def map_directory(domain: str, relative: str) -> str:
    """Map a directory only when it is itself state or a narrow state parent."""
    path=safe_relative(relative).as_posix()
    if is_owned_path(path): return owner(domain,path)
    if domain=="harness" and path not in {"docs","harness"} and any(item.startswith(path+"/") for item in OWNED_PATHS):
        return f"{DOMAINS[domain]}/{path}"
    return path


def relative_path(domain: str, canonical: str) -> PurePosixPath:
    """Decode one canonical Git state path to its selected-domain path."""
    path=safe_relative(canonical)
    if domain not in DOMAINS:
        raise StateDomainError(f"unknown state domain: {domain}")
    prefix=DOMAINS[domain]
    if prefix==".":
        if path.parts[0]==".agent-harness":
            raise StateDomainError("application path cannot reference harness state")
        return path
    expected=PurePosixPath(prefix)
    if path.parts[:1]!=expected.parts:
        raise StateDomainError("path does not belong to the selected state domain")
    return PurePosixPath(*path.parts[1:])


def owns_canonical(domain: str, canonical: str) -> bool:
    """Whether a canonical Git path belongs to one domain's fixed state."""
    try:
        path = safe_relative(canonical).as_posix()
        return any(
            path == owner(domain, logical) or path.startswith(owner(domain, logical) + "/")
            for logical in OWNED_PATHS
        )
    except StateDomainError:
        return False


def expected_path_errors(domain: str, patterns: list[str]) -> list[str]:
    """Reject expected-path globs that could select the other domain's state."""
    if domain not in DOMAINS or not isinstance(patterns,list):
        return ["expected paths have no valid owning domain"]
    if domain=="application":
        forbidden_prefixes=[".agent-harness"]
    else:
        forbidden_prefixes=["feature_list.json","PROGRESS.md",".specify/feature.json","specs","docs/artifacts.json","harness/outcomes.json","harness/recovery-questions.json","docs/exec-plans","docs/generated/documentation-index.md","docs/agent/fresh-session-checklist.md","harness/reviews","harness/attestations","harness/requests"]
    def intersects(pattern: str, prefix: str) -> bool:
        # `matches_expected` applies whole-path fnmatch, where `*` can consume
        # slashes. Refuse any pattern whose literal prefix can reach a reserved
        # subtree; this conservative check avoids finite-sample glob bypasses.
        metachar=re.search(r"[*?\[]",pattern)
        literal=pattern if metachar is None else pattern[:metachar.start()]
        return (literal==prefix or literal.startswith(prefix+"/")
                or prefix.startswith(literal))
    errors=[]
    for pattern in patterns:
        if not isinstance(pattern,str) or not pattern or "\\" in pattern or "\x00" in pattern or pattern.startswith("/"):
            errors.append("expected path is not canonical"); continue
        parts=pattern.split("/")
        if any(part in {"",".",".."} for part in parts):
            errors.append("expected path is not canonical"); continue
        if any(intersects(pattern,prefix) for prefix in forbidden_prefixes):
            errors.append("expected path intersects state owned by the other domain")
    return sorted(set(errors))
