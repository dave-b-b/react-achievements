# In-place Harness Adoption

Last reviewed: 2026-10-18

## Current template delivery hold

The template contains request-bound parallel dispatch for its own reviewed
development workflow, but installations remain serial-only because the
template-only batch runtime is not distributed. It may proceed through the
separate harness review, gate, and merge workflow before downstream owners
individually adopt it; it does not install itself into any destination.
HARNESS-012 is mandatory before a release pull request may merge. Disposable
installation tests remain allowed and do not grant release or deployment
authority.

## Installation boundary

Use `script/instantiate.py` when creating a new repository. Use `bin/agent-adopt` when a version-control repository already exists and its history and files must remain under the owner's control.

Both paths include the pinned Spec Kit `1.0.0` scaffold and Codex skills. Fresh instantiation and private adoption generate `specs/001-repository-initialization` plus a target-owned `.specify/feature.json`; neither inherits the template's active feature.

Choose the distribution on first install with `--distribution shared` or
`--distribution personal`. Omission retains the historical shared default;
`--private` remains an alias for personal mode. Shared mode publishes runtime and instructions for repository users; personal
mode locally excludes installed harness artifacts. In both modes, mutable
application feature state and harness-maintenance state are excluded through
repository-local Git metadata, without changing `.gitignore`. The choice controls
harness visibility only. If feature-state files are already tracked, the plan
lists them and apply removes those paths from the Git index while preserving the
working copies. This affects future commits only: existing commits and their
blobs remain unchanged. This includes mutable harness-maintenance artifacts
such as generated `harness/measurements.json`. Staged state changes must be
resolved before apply. Both modes record the selection in
`harness/distribution.json`; a later request to switch
modes is refused without writes.

After installation, guarded code changes use the normal Git commit boundary,
while feature-ledger, review, attestation, and completion updates remain local.
The harness journals each local transition under private Git metadata so an
interrupted write can be resumed without adding state files or a synthetic
state commit to repository history. Local completion evidence is bound to the
code commit, signed verification receipts, review outcome, current local
ledger, and validated install exclusions. The template checkout retains its
existing commit-bound state flow.

Each worktree has its own fresh `.agent-harness/` state directory, so shared
runtime does not share an individual's active harness work. Existing 2.5.2
installations receive the 2.5.3 runtime and a fresh private state bootstrap
through the reviewed plan/apply adoption flow; existing state remains subject
to the exact-path collision policy.

In a clone of a shared installation, `./init.sh` runs `bin/agent-local-init`
before harness initialization on every invocation. Bootstrap creates missing
generic starter files and preserves existing regular files byte-for-byte, so
an interrupted first run can be resumed without losing feature progress. It
first retries any prepared feature cleanup in both local state domains so an
interrupted removal or purge restores its exact ledger before a missing-file
bootstrap can seed generic state. It then repairs the clone's required
`.git/info/exclude` entries. Unsafe path types, tracked private state, or a
damaged privacy boundary still stop initialization. Each developer's feature
progress remains private to their own checkout.

Neither path installs CI configuration. The template's self-hosted workflow belongs only to this repository; every destination repository chooses its own provider, runner, triggers, and branch policy while retaining `bin/verify all` as the portable local check.

Harness self-tests under `test/` stay in this template repository. Greenfield,
public, and private installations exclude them and mark the template `harness`
test profile unavailable. Installed initialization uses the remaining configured
checks; destination owners configure their own application tests. Installation
does not delete existing destination tests, including tests from older installs.
The template's `.agent-harness/` maintenance state is excluded from installation;
each destination receives fresh application-domain state at its existing root
paths. In an initialized dual-domain repository, select a domain explicitly for
session commands and keep each domain's ledger, pointer, specs, plans, and
request state within its fixed state root.

To yield the active feature, run `bin/agent-session pause [--reason TEXT]`.
Pause captures tracked, staged, and untracked work into a named Git stash and
stores its exact commit and session context under private Git metadata. Use
`queue show|reorder|suspend|unsuspend` to manage order and eligibility,
`activate --feature ID` to begin queued work, `resume --pause-id ID` to restore
paused work, or `archive`/`restore` to retain work outside the active queue.
Resume uses the recorded stash commit and retains that stash as a recovery
copy. A conflict or wrong branch leaves the pause record available for repair.
If a pause is interrupted, complete the matching prepared record with
`bin/agent-session pause --recover --pause-id ID` after checking its branch and
stash identity.

## Updating an installed harness

Version 2.0.0 introduced the breaking state-layout migration. Version 2.1.0
added recovery and cancellation hardening while retaining that layout. Version
2.1.1 closes rotation-intent recovery races. Version 2.1.2 hardens
model-owned release readiness and accepts updates from 2.1.1. Version 2.2.0
adds private pause journals, exact-stash resume, archive/restore, and queue
reordering. Version 2.3.0 adds controller route dispatch and automatic
model-role attribution; its updater accepts supported predecessors through
2.2.0. Version 2.3.1 added guarded adoption of an exact dirty candidate,
schema-12 application-session compatibility for adoption and pause/resume, and
updates from supported 2.3.0 installations. Version 2.4.0 adds owner-confirmed
revalidation of stale terminal feature evidence while retaining prior
attestations, and updates from supported 2.3.1 installations. Version 2.5.0
adds configurable shared/personal distribution and private maintenance state.
Version 2.5.1 keeps application feature state Git-ignored in both modes and
safely untracks already indexed state while preserving working copies. Version
2.5.2 allows source templates with zero active features to be instantiated
while preserving the one-feature path and refusing multiple active features.
Version 2.5.3 recovers the active controller's private model inventory and
launch flow across repository installations.
For a shared installation, preview the public runtime upgrade with
`bin/agent-adopt plan --target /path/to/repository --distribution shared` and
apply with the same target and distribution after reviewing exact-path
authorizations. Commit the published runtime so other users receive it; each
fresh clone then runs `bin/agent-local-init` to create its own private state.
The private `update-plan` path refuses an older shared runtime because hidden
updates alone cannot make a fresh clone usable.

For a personal installation, preview the private runtime update with
`bin/agent-adopt update-plan --target /path/to/repository`; apply only after
reviewing its JSON with `bin/agent-adopt update --target /path/to/repository`.
The update writes harness-maintenance state under `.agent-harness/`, records
that private runtime directory in the repository-local Git exclude file, and
leaves the application's root feature ledger, progress, Spec Kit pointer,
specs, plans, and tasks unchanged. Its delivered entrypoint runs against the
application repository root while loading the installed runtime from
`.agent-harness/`. Unsupported versions, unsafe collisions, and downgrades are
refused. Configure a controller inventory and launch handoff using
`docs/agent/model-selection.md` before using automatic model attribution.
Personal runtime updates include the managed
`harness/controller-preparation.md` guide inside `.agent-harness/`; owner root
instructions and project documentation remain in place.

Update publication is a recoverable transaction. The plan records each existing
destination's regular-file identity, digest, and attached parent identities;
an absent leaf still records the target root and complete existing parent
prefix. Missing parents are created one level at a time from private staging by
no-follow descriptor-relative no-replace moves. Apply accepts a post-plan
parent only when that exact invocation created it, and retains parent/child
descriptors so rollback cannot follow a swapped pathname or remove an outside
directory.
Apply revalidates every planned target, including artifacts skipped because
their bytes and modes were initially identical, moves an exactly authorized
original without replacement into an adjacent `.agent-harness-update-*`
recovery directory, and uses descriptor-bound no-replace publication. All
non-version artifacts publish before `harness/version.json`; a stable schema-2
completion receipt containing the complete artifact and provenance contract
publishes last. A current version marker is a no-op only when every installed
artifact byte and mode plus that exact receipt still match the release. A hard
interruption before the receipt therefore retries missing work or refuses an
owner collision safely instead of laundering partial state as current. On
ordinary failure or interruption, rollback moves back only a publication whose
inode is still owned by this invocation and restores an original only into a
vacant unchanged parent. Concurrent owner replacements are never unlinked;
symlinked or replaced parents refuse, and any unrestored original remains
recoverable in the reported staging directory.

The runtime includes `harness/request_primitives.py`. Source request contracts
and event histories under `harness/requests/` are predecessor-owned state and
are not distributed. A newly generated schema-2 ledger has `request: null`;
schema-1 ledgers retain their legacy shape. This reset applies to generated
source state, not to destination-owned request files: adoption preserves those
files and does not silently rebind an existing project to a template request.

## Source privacy

Installation must not export ignored local source material or recognizable
credential files. Keep real credentials outside the distributable template;
never use real values in fixtures. An ignored `.env` is local configuration,
not an installation artifact. Nonignored credential files require a safe
refusal, not silent copying. Source files are never deleted to make an install
pass, and diagnostic messages must not include file contents.

Raw template sources must be exact Git worktree roots. Distribution includes
tracked files and nonignored untracked files, subject to the installation and
credential-path exclusions. A supplied manifest cannot bypass that policy.
The captured policy is rechecked before publication; concurrent ignore-policy
changes require a fresh attempt. Internally generated public/private source
trees have a separate validated boundary, not a general archive-import bypass.
Adoption stages only regular files of at most 16 MiB, opened without following
symlinks. It verifies their identity and bytes against the planned content digest
before writing the staged artifact; source substitution requires a new plan.

These safeguards are not a general secret scanner. A credential embedded in an
otherwise legitimate source file may evade filename and signature checks.
Review the intended distribution and staged diff before publishing; if a real
credential has already been disclosed, revoke/rotate it through its issuer.
Ignoring a file does not remove an already tracked copy or erase Git history.

## Private brownfield mode

Use this when harness and Spec Kit details must remain local development state:

```bash
bin/agent-adopt plan --private --target /absolute/repository/root --repository-kind code
bin/agent-adopt apply --private --target /absolute/repository/root --repository-kind code
```

Run private adoption from a clean harness-template checkout. An entrypoint inside an installed application repository refuses to package that application as template input. In that case, supply the clean source explicitly on both commands with `--source-template /absolute/path/to/react-achievements`.

Planning is read-only, including the repository-local exclusion file. Apply prepares a target-specific harness in an invocation-owned temporary directory, preserves public files under their existing names, installs `AGENTS.override.md` as the automatic private router, and atomically writes a delimited block to Git's resolved `info/exclude`. It does not modify public `.gitignore` or commits. Existing tracked application state is untracked from the index during installation while its working copy is preserved; staged changes to those paths block apply. Repeating apply performs zero artifact writes when the source and installed state match.

Use `--repository-kind unclassified`, `code`, `content`, or `mixed` on first greenfield or private installation. Omitting it records `unclassified`, which installs safely but blocks model routing until the owner resolves the classification. Reapplication and upgrade preserve an existing classification when the flag is omitted; changing it requires an explicit flag and the normal exact-path collision authorization.

Any differing installed artifact is a collision and fails closed unless the owner authorizes that exact repo-relative path with `--authorize PATH`. Publication failure restores the prior local exclusion bytes and target bytes.

Public reapplication recognizes an already integrated harness only when its installed manifest, semantic version record, and adopter bytes match one complete validated current-source tuple or a versioned predecessor tuple in authenticated template history. A shape-valid manifest, copied adopter, or partial tuple alone is not integration evidence; a `harness/project.json` collision then requires `--authorize harness/project.json`. Authenticated in-place migration does not recreate generic `AGENTS.harness.md`, `ARCHITECTURE.harness.md`, or `README.harness.md` authorities after the destination has deliberately merged and removed them.

## Public brownfield mode

Run `bin/agent-adopt plan --target /absolute/repository/root` first. The JSON Adoption Plan is read-only and includes the immutable harness source revision, ordered content classifications, and whether any collision requires owner attention. The target must be the version-control root; subdirectories and symlink traversal are rejected.

Run bin/agent-adopt apply --target /absolute/repository/root to stage and publish a complete target-specific runtime from the immutable template source. The installed runtime includes bin/python and disables template-only meta-tests before ./init.sh runs. Publication is inode-checked and no-replace. A failed publication restores owned changes where safe and retains the adjacent .TARGET.adopt-* staging directory for recovery; concurrent owner replacements and their displaced originals are preserved rather than overwritten. A second successful apply is a no-op.

Collision handling is explicit:

- `side_by_side` preserves the owner's file and installs the harness authority under its declared harness-specific name. If that alternate file also collides, authorize that exact repo-relative path with a separate `--authorize PATH` occurrence.
- `merge_required` writes nothing and reports additive harness content the owner must merge, such as `.gitignore`.
- `never_overwrite` writes nothing and reports the collision. The harness continues with artifacts it can safely place.
- `--authorize PATH` permits replacement of exactly that declared path. Absolute paths, wildcards, globs, duplicates, and multi-path values are rejected.

During an in-place HARNESS-012 update, a colliding `harness/project.json` is
atomically migrated by preserving the host's existing settings, removing only
the legacy `release-approval` external gate, and adding the required model-owned
`release_authority` policy. The predecessor project schema, installed manifest,
semantic version record, and adopter provenance tuple are validated before
publication. If a colliding predecessor execution contract would be skipped,
adoption refuses the partial migration before any write; authorize the required
runtime updates together so the project schema and compatible runtime publish as
one transaction. Each differing provenance member requires its own exact
`--authorize PATH`, even when `harness/project.json` is authorized. Project
authorization does not authenticate an installed tuple or authorize its other
paths. When provenance artifacts collide, the manifest, version, and adopter
refresh together in that same staged transaction or the operation refuses;
invalid metadata never advances only part of the tuple. No application
commands, unrelated gates, or other project settings are replaced.

Every provenance member, including skipped and refreshed members, remains part
of that tuple. During migration, every skipped release-coupled runtime member
also remains a guarded input, even when it was initially identical to the source.
Source bytes, target inode/content identity, current filenames,
and parent attachments are revalidated before, during, and after publication.
Same-content replacement is a change, not proof of ownership. A concurrent
change refuses; rollback removes only publications still owned by this
invocation and restores displaced originals only into unoccupied names. Owner
replacements and recovery backups remain available for explicit recovery.
Publication and restoration use retained no-follow parent and leaf descriptors.
This includes initially absent public-adoption leaves: their planned root and
existing parent prefix are mandatory attachments, and any missing suffix is
created and rolled back only through retained descriptors.
The staged leaf must retain its planned identity immediately before the move;
a substitution at the move boundary is removed from the destination into
recovery without overwriting it, allowing safe restoration of owned originals.
After successful publication, original backups are intentionally retained and
reported through `recovery_staging` for explicit owner cleanup. Automatic
cleanup removes only empty directories: it never validates a backup and then
unlinks its pathname, which could delete a concurrent replacement.

Adoption never guesses install/start commands, application unit or E2E commands, product truth, architecture truth, or external-gate resolution. Configure those in the adopted repository before claiming application readiness. Base harness readiness is not application readiness.

After public in-place adoption, create or select the repository's first feature with the installed Spec Kit workflow so `.specify/feature.json` points at a target-owned directory under `specs/`. Private mode does this automatically. Use Spec Kit for the feature specification, plan, and tasks. Keep `feature_list.json` as the execution-state authority and use `bin/agent-session` for verification receipts and handoff eligibility.

Both modes install the schema-4 `harness/model-routing.json` and the
`harness/review-policy.json` contracts byte-for-byte. The destination's active
controller supplies a current inventory of models it can execute, including
models from multiple providers, strength rankings, and supported reasoning
efforts. The local policy selects the lowest-cost eligible builder, then
selects the strongest distinct reviewer across providers at high reasoning;
agent review requires the high-reasoning capability, and security-sensitive
code requires distinct code, security, and final reviewers. Existing private
installations retain collision protection, so replacing either routing contract
requires exact authorization of that path.
Code review payloads additionally use the structured quality contract in
`specs/004-owner-selectable-independent-review/contracts/review-evidence.md`:
all DRY/SOLID/YAGNI principles are addressed, every finding has safe evidence,
and the outcome is mechanically consistent with open material or advisory
findings.

## Continuation policy

Installed repositories also receive `harness/execution-policy.json` and the
semantic `harness/version.json`. At session start, the owner may choose:

The agent-review examples below assume the active controller supplied its
authenticated builder launch context. For a direct manual session, append
`--review-mode human`. The same rule applies when `activate` or `revalidate`
starts a replacement feature session.

```bash
bin/agent-session intent --prompt "When you're done, continue overnight."

Sessions default to yolo continuation. Use `--guarded` for explicit-stop
operation; `--yolo` remains accepted for clarity. Yolo continues eligible
commits, reviews, retries, and handoffs, but does not invent product decisions
or bypass typed evidence, durable request settings, scope gates, external
authority, or publication boundaries.
bin/agent-session start --preserve-dirty --item FEATURE-ID
bin/agent-session start --preserve-dirty --item FEATURE-ID --execution-mode task
bin/agent-session start --preserve-dirty --item FEATURE-ID --execution-mode feature
bin/agent-session start --preserve-dirty --item FEATURE-ID --execution-mode features --max-features 3
```

When the request names a successor, its feature entry must declare the same
canonical `spec_directory` under `specs/` that Spec Kit selected and the exact
ordered `task_ids` in that ledger. The guarded boundary pins those bytes before
the local commit; `advance` refuses missing or changed mappings rather than
searching the backlog. New planning/instantiation scaffolds should set this
field alongside `.specify/feature.json` so an owner need not discover it as a
runtime flag.

The default request mode continues without a confirmation prompt through the
explicit `--follow-on` request queue. It never falls back to a priority-ordered
backlog successor. Use
`bin/agent-session checkpoint --task T001` after completing a planned task.
Task mode returns `STOP_AFTER_TASK`; feature mode returns `CONTINUE_FEATURE` or
`STOP_AFTER_FEATURE`; request mode returns `CONTINUE_REQUEST` until no eligible
feature remains (or a requested feature is blocked); bounded features mode
returns a bounded continuation decision. New request sessions may use the typed
guarded `review`, `commit`, and `advance` boundary for a scoped local commit;
manual commit and human review selections stop. It requires current receipts,
review, isolated index reservation, and the exact persisted successor. It never
pushes, opens a pull request, merges, releases, deploys, or weakens
`mark-passing`.

This interim installation is serial-only and deliberately omits
`bin/agent-batch`, `script/batch.py`, and `harness/batch-policy.json`. Existing
destination copies of those template development artifacts are never deleted:
installation refuses so the owner can preserve or remove them deliberately.
An incomplete, stale, dirty, or unverified private batch state in the source
template is refused before publication. Certified packaging reads actual tracked
bytes through no-follow descriptors and compares them with the certified Git
head, including files hidden from status by Git stat-cache flags. Stable Git,
tracked-file identities, private authority namespaces, and controller inventory
are rechecked after authority reads and immediately before installation
publication. Instantiation also compares every copied tracked file, its attached
ancestor identities, executable mode, and digest with that same certified clean
snapshot before copying; late or transient source changes cannot install an
uncertified snapshot.
HARNESS-011 still requires its external
review and acceptance gates; HARNESS-012 installs model-owned technical release
readiness. Publication and pull-request merge still require explicit authority;
neither is satisfied by installation tests.
