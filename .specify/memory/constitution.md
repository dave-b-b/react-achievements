<!--
Sync Impact Report
==================
Version change: 2.0.0 → 3.0.0
Rationale: the owner authorizes parallel requested features. Principle IV's
global WIP limit becomes one feature and writer per implementation worktree;
Principle V reserves batch completion for verified integration. These redefine
core principles and require a MAJOR constitution bump. The separately versioned
harness runtime and historical attestations are unchanged.

Modified principles:
- IV. Bounded Scope and Feature-List Primacy → per-worktree ownership.
- V. Evidence-Gated Completion → workers hand candidates to integration.
Affected references:
- `AGENTS.md`, `ARCHITECTURE.md`, and `docs/agent/README.md` describe ownership.
- HARNESS-011 T086 and the batch contract define the migration and checks.

Added sections: none.

Removed sections: none.

Source basis: WalkingLabs "Learn Harness Engineering" lectures 01-13, pinned at
commit e587e4cce9cfe9b0523fd79d6e0152d4a1f1dfc3, as mapped in
docs/walkinglabs/compliance-matrix.md.

Follow-up TODOs:
- Upstream now publishes a fourteenth lecture ("From Single Loops to Graph
  Engineering") that is not present at the pinned commit. Principle VIII of the
  Governance section requires a reviewed re-pin decision; see Next Actions.
-->

# React Achievements Constitution

## Core Principles

### I. Host-Agnostic Portability (NON-NEGOTIABLE)

This repository is a reusable control plane, not an application. It MUST be
instantiable into any host repository regardless of language, framework, package
manager, or runtime.

- The harness MUST NOT require a specific language, framework, service, or
  network access to run its own base profiles.
- Harness implementation MUST depend only on the Python standard library and
  Git. New third-party runtime dependencies are prohibited without an amendment.
- Every host-specific value MUST be declared as data in `harness/project.json`
  (commands, profiles, external gates, identity terms), never hardcoded in
  harness sources.
- Application code MUST NOT depend on harness implementation. The harness MAY
  inspect and execute reviewed application entrypoints; the dependency direction
  is one-way and MUST NOT be inverted.
- Instantiation via `script/instantiate.py` MUST remove predecessor identity,
  `.git`, sessions, receipts, attestations, outcomes, and inherited
  measurements, and MUST leave the generated repository passing generic
  verification with no stale authority.

Rationale: A harness that only works in the repository that grew it is a
one-off. Portability is the product.

### II. Repository as System of Record

Information not present in the repository does not exist for an agent.

- A fresh session MUST be able to answer, from repository files alone: what the
  system does; who owns each architecture boundary; how to initialize; how to
  verify; and what feature, blocker, evidence state, and next action are
  current.
- Repository artifacts, executable checks, and retained evidence MUST outrank
  conversation history. Conversation is never authority.
- Authority boundaries MUST remain single-owner: `AGENTS.md` for operating
  rules, `ARCHITECTURE.md` for boundaries, `feature_list.json` for execution
  state, `docs/exec-plans/active/` for rationale and definition of done,
  `PROGRESS.md` for milestone narrative, `harness/project.json` for reviewed
  commands.
- Volatile per-worktree data under `.git/repository-agent-session/` MUST NOT be
  treated as repository truth.
- Knowledge MUST be updated with the code it describes. Stale documentation is
  treated as a defect, not a cosmetic issue.

### III. Routed Instruction Architecture

Root instructions are a router, not an encyclopedia.

- `AGENTS.md` MUST remain a compact router that links to focused authorities
  rather than absorbing their content. This is enforced by
  `test_root_agents_file_stays_a_compact_router`.
- Every registered authority link MUST resolve; broken or unregistered links
  fail the `docs` profile.
- Generated documentation MUST be byte-deterministic, and stale generated output
  MUST be rejected by `check-docs`.
- Generated output MUST NOT override curated product or architecture truth.

Rationale: Instruction bloat crowds out context budget and buries hard
constraints in the middle of long files, where they are reliably ignored.

### IV. Bounded Scope and Feature-List Primacy

- Each implementation agent and worktree MUST own exactly one `in_progress`
  feature and each feature/worktree MUST have one writer. Multiple requested
  features MAY be active concurrently in distinct worktrees. Read-only reviews
  do not acquire writer ownership.
- The controller MUST bind feature, worker identity, worktree and starting
  commit, refuse duplicate assignments, respect dependencies, and confirm real
  startup. It MUST collect results and resume eligible unfinished work or retain
  an actionable blocker. A queued launch or ended turn is not completion.
- Work MUST stay within the active feature's declared behavior and expected path
  surface. Opportunistic refactors, cleanup, and unrelated features are
  prohibited within a feature's session.
- Each worktree's `feature_list.json` is its feature-state authority. Each entry MUST
  carry behavior, required verification, and current state; entries MUST conform
  to the strict recursive schema.
- Feature data MUST NOT supply shell commands, weaken verification, or reference
  unknown profiles. Canonical commands are reviewed argv arrays in
  `harness/project.json`, executed without a shell.
- Unexplained worktree deltas outside the declared path surface MUST fail
  rather than be absorbed silently.
- Blockers MUST be explicit, actionable, and retained for the next session.

### V. Evidence-Gated Completion (NON-NEGOTIABLE)

Completion is an externalized, conjunctive determination — never a self-report.

- `passing` MUST be reachable only through `python3 script/harness.py
  mark-passing`, which requires a pristine committed baseline, an unchanged
  active session, complete successful receipts for every required profile, and
  zero open external gates.
- `passing` and its evidence MUST NOT be hand-edited.
- Batch workers MUST stop at candidate readiness and MUST NOT publish final
  passing or activate another feature. Only the integration coordinator may
  publish completion after reviewed candidates are combined and fresh checks
  and applicable reviews cover the combined result. Historical serial passing
  attestations remain valid; assignments supply no completion authority.
- Missing, stale, unavailable, unbaselined, or open-gate evidence MUST remain
  nonpassing.
- A `finish --check-only` verdict is a handoff assessment only. It is NOT merge,
  release, deployment, or self-approval authority.
- Failures MUST NOT be hidden by changing tests, commands, feature state, or
  evidence. Missing tools, credentials, platforms, services, or reviews remain
  nonpassing.
- Core functionality MUST be verified before performance work or refactoring.

Rationale: Agents are systematically overconfident. Termination authority must
live outside the agent that did the work.

### VI. Full-Pipeline Verification; Unavailable Is Not Passing

- `bin/verify all` MUST select every configured profile dynamically; adding a
  profile MUST NOT require editing the runner.
- `./init.sh` MUST run configured install/start followed by fast static and
  documentation readiness, and MUST omit the long behavioral harness suite.
  The complete configured suite MUST run once on the frozen final candidate
  before handoff; it MUST NOT be repeated after every bookkeeping change.
- Reuse across generated continuation bookkeeping is allowed only through an
  exact, authenticated same-source proof that preserves original receipts and
  records both verification source and resolution commits. Any substantive
  source, command, requirement, owner-baseline, receipt, or acceptance drift
  requires fresh verification or fails closed.
- A profile with no configured commands is `unavailable` and MUST fail
  explicitly. Unavailable is never "skipped" and never "passing".
- `app-unit` and `app-e2e` MUST remain unavailable in the base template and MUST
  be configured by each host repository before that repository is application
  ready.
- Each host repository MUST wire at least one real compositional user journey
  that is capable of failing while isolated unit tests pass.
- Architectural invariants MUST be expressed as executable checks, not prose.
- Failure messages MUST state how to repair the failure, not only that it
  occurred.

### VII. Observability, Attribution, and Privacy-Safe Evidence

- Verification MUST stream output live while retaining only allowlisted
  metadata and SHA-256 output digests — never raw output, prompts, credentials,
  environment values, or user data.
- Receipts MUST be session-authenticated, chronologically bounded, atomically
  published without replacement, and confined to a strict fail-closed namespace.
- Every failure MUST be attributed to exactly one of the five layers: task
  specification, context, environment, verification, or state.
- Significant failures, recoveries, and false-completion claims MUST be recorded
  with `record-outcome` so `metrics` reflects durable outcomes rather than
  recollection.
- Durable summaries MUST NOT contain credentials, personal data, or raw logs.

### VIII. Non-Destructive Clean Handoff

- The harness MUST NEVER clean, reset, revert, delete, or overwrite user work
  to manufacture cleanliness. Stash creation/application is permitted only in
  an explicit owner-requested pause/resume transaction that journals intent,
  records the exact stash commit, preserves the stash through restoration, and
  refuses stale or partial state. Ordinary startup, checking, verification,
  finish, and error recovery MUST preserve work in place. The recorded stash
  remains as a recovery copy after restoration.
  The guarded local `commit` and `advance` boundary remains a separate narrow
  exception: typed policy, current receipts, distinct review, scoped changes,
  a prepared commit, and owner-index compare-and-swap checks are required; it
  never grants publication.
- `finish` MUST be read-only: it runs no checks and changes no files.
- Pre-existing work and concurrent edits the session did not create MUST be
  preserved and attributed.
- Sessions MUST end with `PROGRESS.md`, decisions, blockers, risks, and an
  ordered next action current, and MUST leave the repository immediately
  runnable and diagnosable by a fresh session.
- Committing, pushing, opening a PR, merging, deploying, and self-approving
  require explicit authority and MUST NOT be performed on the harness's own
  initiative.

## Integration Constraints

These constraints govern what a host repository owes the harness, and what the
harness owes the host.

- **Configuration surface.** A host repository integrates by editing
  `harness/project.json` (commands, profiles, external gates, timeout, identity
  terms) and by replacing the product and architecture contracts. It MUST NOT
  need to edit `script/harness.py` to onboard an ordinary stack.
- **Entrypoint stability.** `./init.sh`, `bin/agent-session`, and `bin/verify`
  are the public interface. They MUST resolve the repository root from any
  caller directory and MUST remain stable across template versions; breaking
  them is a MAJOR change.
- **Initialization is its own phase.** `./init.sh` MUST run configured install
  then start commands in order and propagate failure, followed by fast static
  and documentation readiness. Feature work MUST NOT begin on a broken
  baseline; the complete behavioral suite runs once against the frozen final
  candidate before handoff.
- **Mandatory downstream gates.** A generated repository is not application
  ready until it configures and proves: dependency installation and
  startup/readiness from a fresh checkout; at least one real application unit or
  behavioral test; a real integration or end-to-end user journey; stack-specific
  architecture, security, side-effect, cleanup, concurrency, and isolation
  invariants; stack-appropriate runtime observability; an owner-authorized
  immutable committed baseline; and every applicable external authority.
- **Passing base is not application readiness.** A green base harness MUST NOT
  be reported as evidence that the host application works.
- **External gates.** `independent-review`, `credentials`, `physical-device`,
  `production-service`, and `release-approval` MUST be resolved by their actual
  authority. No local profile can satisfy an external gate.
- **Loop and parallelism boundary.** Requested parallel work uses isolated
  implementation worktrees, bounded controller execution and separate makers
  and checkers. Local commits use the existing authorized boundary. Pushes,
  protected-base merges, releases and deployments require separate authority.
  Installed hosts without the batch runtime retain serial execution.

## Development Workflow and Quality Gates

- **Clock in.** Confirm repository root and full Git state; read `AGENTS.md`,
  `ARCHITECTURE.md`, `PROGRESS.md`, `feature_list.json`, `docs/agent/README.md`,
  and the sole active plan; run `./init.sh`; run `bin/agent-session doctor` and
  resolve contradictory authority before editing.
- **Session mode.** Use `--preserve-dirty` for ordinary attributed work and
  `--require-pristine` for certification or release.
- **Failure loop.** Execute, observe, attribute to one of the five layers,
  repair the responsible layer, and rerun. Record significant events with
  `record-outcome`.
- **Base acceptance gate.** Before the template is treated as a valid basis for
  another repository, all of the following MUST hold: the unittest suite passes
  with no skips; `bin/verify all`, `check-docs`, `check-artifacts`, and
  `git diff --check` pass; instantiation strips predecessor identity;
  template→A→B and application→B disposable paths pass generic verification;
  current evidence is reviewed on immutable bytes; and base core, application
  gates, external gates, and conditional loop controls are reported separately.
- **Review currency.** A prior review does not approve later remediation.
  Re-review is required on the immutable bytes that changed.
- **Clock out.** Run all required profiles, inspect per-check outcomes, update
  durable state, and run `bin/agent-session finish --check-only` without
  mutating the worktree.

## Governance

- This constitution supersedes conflicting practice, prompts, and conversation
  history. Where `AGENTS.md` and this constitution conflict, this constitution
  governs and `AGENTS.md` MUST be corrected.
- Amendments MUST be proposed as a change to this file, MUST state the version
  bump and its rationale, and MUST update any dependent authority in the same
  change. Amendments that alter an executable contract MUST land with the
  corresponding test change.
- Versioning is semantic. MAJOR: removing or redefining a principle, or breaking
  a public entrypoint or the `harness/project.json` schema. MINOR: adding a
  principle or section, or materially expanding governed scope. PATCH:
  clarification and wording that changes no obligation.
- Compliance review: every change MUST be checked against these principles
  before it is treated as complete. `docs/walkinglabs/compliance-matrix.md` is
  the standing status contract and MUST be updated when a principle's executable
  evidence changes.
- Source pinning: the upstream curriculum revision recorded in
  `harness/project.json` is authoritative and immutable.
  `test_repository_contracts_are_current` rejects silent changes to its name,
  URL, or commit. Adopting a newer upstream revision is an explicit, reviewed
  amendment — never an incidental edit.
- Complexity MUST be justified against Principle I. A feature that only serves
  one host repository does not belong in the template.
- `AGENTS.md` and `docs/agent/README.md` provide runtime development guidance;
  this constitution provides the non-negotiable rules they implement.

**Version**: 3.0.0 | **Ratified**: 2026-08-04 | **Last Amended**: 2026-09-18
