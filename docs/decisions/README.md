# Decision Log

## 2026-10-22 — Preflight review readiness before expensive verification

Decision: agent-review verification refuses before executing profile commands
when the active builder identity is missing or stale. `review-preflight`
validates the complete ordered reviewer route against the pinned inventory and
emits a manifest bound to the candidate tree and governed surface. A route
manifest is not execution evidence; the active controller must launch each
stage and submit authenticated review context.

Rationale: a session restart can clear builder attribution while leaving the
feature active. Running a long final suite in that state produces receipts
that cannot reach an eligible reviewed handoff. The early check makes this
failure deterministic and the manifest gives the controller one exact source
for stage order and launch settings.

Rejected alternatives: inferring execution from route selection, downgrading to
human review, or allowing missing model attribution through final verification.

Affected constraints: `script/harness.py`, `bin/agent-session`, model-selection
guidance, and HARNESS-020 verification. This does not execute provider models
or weaken the authenticated review stages.

Reopening condition: a controller adapter provides an authenticated automatic
dispatch protocol that can replace the explicit manifest handoff without
weakening candidate or reviewer identity binding.

## 2026-10-20 — Keep all installed work state out of Git

Decision: the first-install choice controls only whether harness runtime and
instructions are shared (`shared`) or personal (`personal`). In either mode,
application feature state and harness-maintenance state stay local to the
worktree and are excluded through repository-local Git metadata. When an
existing install tracks application feature state, adoption or update removes
those paths from the index while preserving working copies; staged changes
block the operation.

Rationale: progress and planning files churn during ordinary work and should
not become repository history or create review noise. Harness visibility is
the only collaboration choice owners need to make.

Rejected alternatives: asking which state domain should be local, tracking
application progress in shared installs, or editing public `.gitignore` files.

Affected constraints: greenfield instantiation, brownfield adoption and update,
local Git exclusions, installation documentation, and patch version 2.5.1.

Reopening condition: the owner changes the harness visibility choices or the
rule that work state is never Git tracked.

## 2026-10-20 — Make verification selection deterministic and run the full gate once

Decision: development feedback uses a reviewed source-path-to-test-module map;
unknown or shared-core paths select the whole suite. Final verification remains
complete and signed, but runs once through the active session. Parallel test
modules execute in isolated child processes and report progress. A valid
successful receipt is reusable only for the exact current session and candidate
binding. During an active session, `bin/verify all` uses the signed path rather
than running an unsigned duplicate.

Rationale: repeatedly executing the same full suite adds hours without new
coverage, while selective tests can speed repair if their mapping is
deterministic and defaults safely to full coverage. Exact receipt binding
allows retries to reuse completed work without allowing changed candidates to
inherit stale evidence.

Rejected alternatives: relying on prose alone to avoid duplicate full runs,
allowing unknown paths to select no tests, treating focused tests as final
evidence, or accepting receipts after candidate/profile/requirement changes.

Affected constraints: `bin/test-fast`, `bin/test-shards`, signed profile
receipts, `harness/project.json`, and the final verification procedure.

Reopening condition: measurements show sharding or mapped selection reduces
coverage, or a stronger trusted build-cache mechanism replaces session-bound
receipts without weakening final verification.

## 2026-09-25 — Make technical release readiness model-owned

Decision: retire `release-approval` as a human/external technical gate. Every
configured release-readiness decision uses the routed, distinct, read-only,
high-reasoning `final_authority` model stage, bound to the exact candidate,
current evidence, policy, scope, and controller inventory. Publication remains
explicit owner authority.

Rationale: release review is a repeatable technical quality decision and should
not require the owner to repeat the same review. The model stage preserves
separation from the builder and keeps unavailable or stale review evidence
fail-closed.

Rejected alternatives: silently treating any model as release authority,
allowing the builder to self-approve, removing final authority entirely, or
granting model approval push/merge/deploy authority.

Affected constraints: `harness/project.json`, `harness/review-policy.json`, the
shared model-routing contract, adoption documentation, and technical release
readiness semantics. Credentials, device, production, independent review, and
explicit publication gates remain separate.

Reopening condition: the owner changes the release-readiness role, evidence
binding, model inventory trust boundary, or publication boundary.

## 2026-09-18 — Scope active-feature ownership to each worktree

Decision: implement the owner's requested one-feature-per-agent/worktree rule
and allow concurrent requested features in isolated worktrees. Commit the
verified amendment before launching remaining work. Constitution 3.0.0 replaces
the global WIP limit; existing ledger schemas and passing attestations remain.

Rationale: global active-item selection conflicted with parallel dispatch and
left workers without a valid local feature/spec scope. Preparation now binds
that scope, refuses duplicate assignments, and prohibits worker completion.
The controller must confirm startup and collect actual results through reviews
and repairs. Changing only prose or treating queued launches as running was
rejected. The controller cannot manufacture review or passing evidence.

Affected constraints: HARNESS-011 T086 bootstrap and template batch commands.
Installed hosts remain serial; release, installation and final acceptance gates
are unchanged. Reopen if ownership, completion authority or runtime distribution
changes. The existing uncommitted certification patch remains preserved in its
original checkout for the HARNESS-011 worker.

Status: current
Last reviewed: 2026-09-17

Record durable decisions that a fresh session must not rediscover. Each entry must include the date, decision, rationale, rejected alternatives, affected constraints, and reopening condition.

## 2026-09-17 — Bind independent review to explicit quality evidence

Decision: HARNESS-010 review evidence must carry an explicit agent mode,
request/continuation scope, exact source and feature digests, and the current
review-policy binding. Code/design-quality evidence must address DRY, every
applicable SOLID principle, and YAGNI, require safe evidence for each finding,
and derive a pass, pass-with-advisories, or blocked outcome from finding state.

Rationale: a summary-only checklist could appear complete without showing what
was inspected or whether unresolved material design debt remained. Mechanical
outcome consistency preserves fail-closed readiness while allowing justified
exceptions, non-applicability, and advisory feedback.

Rejected alternatives: self-scored quality checklists, optional finding
evidence, mandatory abstractions for every repetition, and treating tests or
linters as a substitute for independent review.

Affected constraints: HARNESS-010 review evidence only. This does not mark the
feature passing, resolve its independent-review gate, alter the sole active
feature, or grant integration, release, publication, or identity authority.

Reopening condition: the owner changes the review mode, quality rubric,
evidence binding, or external acceptance boundary.

## 2026-09-07 — Close HARNESS-005's actual independent-review gate

Decision: record actual read-only code/design acceptance by GPT-5.6 Sol,
security acceptance by Daybreak, and final acceptance by GPT-6 Astra, then remove
only HARNESS-005's item-level `independent-review` gate. Reviewers explicitly
concurred in this closure; no local test or builder self-score substituted for it.

Approved scope: unchanged runtime/test path-mode-bytes fingerprint
`66eada1c8961660596c6ff21942199d8a9bc9f8a88a753dbcc6278e02db1633b`, plus the
six-file closure candidate against `586e20a` with fingerprint
`14d5da296c85217e36af0f63b69f9314ba8d3c7983deb65afc8dadbd537917bb`.
The metadata covers progress, decisions, active plan, feature list, outcomes,
and the selected task ledger. It includes the narrow T078 exception and queued
DRY/SOLID/YAGNI requirement, not implementation of HARNESS-010 or HARNESS-011.

Rationale: all current HARNESS-005 task behavior has reviewed regression coverage;
the owner disposed the missing historical sequence without relaxing future work.
W4 trace/checkpoint, six observability tests, and 26 adoption tests passed.

Rejected alternatives: self-approval, removing the project-wide or successor
gates, or treating old runtime reviews as approval of changed metadata.

Affected constraints: this feature's external review only. The ensuing local
commit must receive exact-commit confirmation from all three reviewers and fresh
pristine signed profiles plus a clean finish before `mark-passing` can activate
HARNESS-011. Overall completion, real-installation, and publication holds remain.
Review identities are external controller attributions, not cryptographic proof
of authorship provided by the repository.

Reopening condition: reviewed behavior, source, scope, or policy changes, or a
reviewer withdraws approval. Missing/stale receipts still refuse passing.

## 2026-09-07 — Accept the bounded T078 test-history exception

Decision: the owner approved continuing after the missing original failing-test
record was explained. Dispose T078 on the existing current regression coverage
with this one-time process exception; do not claim its original tests-first
sequence was proven. The general tests-first rule remains unchanged.

Rationale: the current interruption, unsafe-outcome, and installation-privacy
regressions exist and pass, but later verification cannot reconstruct the lost
historical sequence. Sol's acceptance-path audit confirmed this is a historical
gap, not an uncovered behavior or authority to remove tests.

Rejected alternatives: fabricating RED evidence, removing safeguards or tests,
rewriting the general rule, or using the exception as independent approval.

Affected constraints: only T078's historical process acceptance. Current
code/security/final-acceptance review and pristine commit-bound profiles remain
required before HARNESS-005 passes. The parallel/default-review requirements,
completion and real-installation holds, and no-push/main-merge boundaries remain.

Reopening condition: a current regression or review exposes an unmet behavior,
or the owner changes this narrow disposition. New work must retain test-first
evidence; this record supplies no standing exception.

## 2026-09-07 — Require pragmatic DRY, SOLID, and YAGNI review

Decision: queued HARNESS-010 must make DRY, applicable SOLID principles, and
YAGNI explicit in the independent code/design-quality review stage. Interpret
"yangi" as YAGNI. Record justified exceptions and material versus advisory
findings; require current review of the clean integrated output as well as
feature candidates. Agent review remains default, with the human option intact.

Rationale: the owner requests maintainable code without unnecessary complexity.
The active plan retains the normalized scope, evidence, and re-review criteria.

Rejected alternatives: a checklist self-score as approval, treating test/linter
success as design review, mandatory abstraction for all repetition, removing
required safety behavior under YAGNI, or treating branch review as approval of
a changed integration result.

Affected constraints: HARNESS-010's future specification and evidence contract,
and the whole-harness completion/install hold. The existing Terra/Sol/Daybreak/
Astra lineup and distinct-model rule remain; Sol owns code/design-quality review,
not security or final acceptance. No runtime routing, active pointer, task state,
historical passing evidence, or T078 disposition changes in this intake.

Reopening condition: the owner clarifies the intended acronym or changes the
review requirement, or the separately specified implementation demonstrates
that an applicability rule needs refinement without weakening review authority.

## 2026-09-07 — Authorize reviewed local checkpoints only

Decision: the owner's explicit approval permits local checkpoint commits of the
reviewed harness work on a `codex/` branch. Preserve the attributed existing
changes and queued design together without claiming other features are built.
The skill's HARNESS-ID imperative subject convention applies because this
repository has no separate `docs/commit-messages.md` policy.

Rationale: worktrees need a durable baseline containing the reviewed changes;
the prior missing commit authorization is now resolved.

Rejected alternatives: silently committing before approval, discarding prior
work, treating this approval as a push/main-merge/install grant, or waiving
missing original test-first history and external acceptance gates.

Affected constraints: the local commit boundary only. HARNESS-005 remains active,
T078 unresolved, and HARNESS-011 queued; completion and real-installation holds
remain in effect.

Reopening condition: the owner changes local commit authority or explicitly
resolves a separate acceptance/publication gate.

## 2026-09-07 — Require parallel-default delivery before installation

Decision: multi-feature requests default to concurrent dependency-ready builders
in separate Git worktrees. Serial execution requires an explicit preference;
single-feature scope remains available. Only an integration owner combines
reviewed pinned commits, reconciles branch-local state, and obtains fresh
verification and applicable review of the complete clean result. Branch-local
readiness is not final passing. Retain main-merge and publication authority.

Rationale: the owner explicitly requires this before completion and installation
elsewhere. Current intent defaults to serial, batch creation does not dispatch
workers, and the all-merged readiness flag lacks combined-result verification.
An unchanged legacy passing feature is not evidence for the new requirement.

Rejected alternatives: changing only prose or an intent label; concurrent writers
in one checkout; treating merged as verified; silently expanding an exhausted
request; blindly merging feature ledgers; or claiming a fixture worker proves a
real provider adapter works.

Affected constraints: HARNESS-011, US7, FR-055-FR-062, T086-T097, and the active
plan's completion/install hold. T086 must amend global WIP and passing semantics
with executable checks and migration before implementation. The current
HARNESS-005 pointer, task binding, and historical passing evidence are preserved.
Models remain Terra implementation, Sol code review, Daybreak security review,
and Astra final acceptance. No real-repository installation or local commit is
authorized by this planning record.

Reopening condition: the owner explicitly changes the requirement, or all new
behavior and remaining delivery gates pass on the authorized immutable result.

## 2026-09-07 — Owner-approved code and security classification

Decision: classify this repository as code and HARNESS-005 hardening as high-risk,
security-sensitive code, as explicitly approved by the owner. Terra implements;
Sol reviews code; Daybreak reviews security; GPT-6 Astra performs the distinct
read-only final-acceptance stage after them. Use the Codex controller's available
models without claiming provider independence or silently replacing a reviewer.

Rationale: accidental secret retention and process cancellation require explicit
security acceptance criteria. Record only public classification and model roles,
never credentials, model prompts, environment values, or raw output.

Rejected alternatives: infer owner authority from model discovery, leave the
repository unclassified, treat high risk as permission to commit, or claim a
local review is immutable final acceptance.

Affected constraints: model routing, HARNESS-005 scope, FR-051-FR-054, and the
active sprint contract. The verified candidate is version 1.5.0 (previous 1.4.0)
because optional task ownership and session schema 5 extend the public contract;
the version does not imply publication or release authorization. The remaining
approved review findings stay separate.

Reopening condition: the owner changes classification, role approval, scope, or
explicitly authorizes the immutable commit and final acceptance boundary.

## 2026-07-30 — Harness authority and safety

Decision: repository artifacts and executable evidence outrank conversational claims. Verification commands are fixed argv arrays; receipts retain sanitized metadata and digests; repository symlinks are rejected by default; destructive Git and publication actions are outside harness authority.

Rationale: these boundaries preserve user work, make failures diagnosable, and prevent feature data from weakening its own checks.

Rejected alternatives: shell commands embedded in feature state, raw output retention, automatic cleanup, automatic commits, and self-approval.

Reopening condition: a repository owner approves a narrower or stronger replacement with executable regression coverage.

## 2026-08-06 — Hold the WalkingLabs curriculum pin

Decision: retain `e587e4cce9cfe9b0523fd79d6e0152d4a1f1dfc3` as the immutable curriculum source for this feature. The specification, requirements, and compliance matrix continue to cover the thirteen lectures present at that revision.

Rationale: upstream now publishes a fourteenth lecture, "From Single Loops to Graph Engineering." Adopting it would change the specification basis, source fingerprint, compliance mapping, and executable obligations while implementation is in flight.

Rejected alternatives: silently following upstream `main`, re-pinning during this implementation, or describing the thirteen-lecture matrix as current with all upstream material.

Affected constraints: Constitution source pinning, FR-049, FR-050, W6, and the scope assumptions in `specs/001-harness-engineering-contract/spec.md`.

Reopening condition: a separately specified and reviewed feature adopts a newer immutable revision and updates every dependent contract and executable check together.

## 2026-08-15 — Keep CI repository-owned

Decision: this template's GitHub Actions workflow runs `bin/verify all` on a self-hosted runner. Greenfield instantiation excludes `.github/workflows/`, and brownfield adoption neither installs nor merges CI configuration.

Rationale: the harness owns a portable local verification entrypoint, but CI providers, runner infrastructure, credentials, triggers, and branch policy belong to each destination repository owner.

Rejected alternatives: inheriting the template workflow in every generated repository, reporting CI as merge-required during brownfield adoption, or removing this template's owner-requested workflow.

Affected constraints: HARNESS-008 FR-014 and FR-015, CI evidence-surface tests, the adoption manifest, greenfield copy inventory, and destination CI preservation.

Reopening condition: a repository owner explicitly requests an opt-in CI integration contract that preserves destination choice and ships with independent installation tests.

## 2026-08-16 — Require explicit template authority for installed-host adoption

Decision: private adoption may instantiate only from a validated harness-template checkout. Template-local commands use their own root; commands copied into an application repository require `--source-template` and refuse to traverse the application as template input. Public reapplication recognizes an integrated harness and does not recreate deliberately removed side-by-side authority documents.

Rationale: application repositories contain product bytes and valid filesystem structures, including ignored build symlinks, that are neither portable harness input nor safe implicit template authority.

Rejected alternatives: recursively treating installed applications as templates, guessing a sibling checkout, omitting the instantiator from public adoption, and recreating duplicate generic authority files on every update.

Affected constraints: HARNESS-008 FR-003, FR-004, FR-009, FR-010, and FR-016; public adoption inventory; private plan/apply source identity; integrated update idempotence.

Reopening condition: a reviewed embedded-distribution format supplies a complete immutable template payload without reading application-owned bytes.

## 2026-08-20 — Route by eligibility and subscription lane

Decision: treat GPT-5.3 Codex Spark as a separate preview-capacity lane and Sol, Terra, Luna, and Daybreak as consumers of the shared standard subscription lane. Select the least expensive eligible route only after capability, risk, verification, and authority requirements are met. Every Sol selection, fallback, and Spark bypass requires a declared reason code; unavailable Sol planning or final authority blocks.

Rationale: bounded Spark work can preserve standard allowance, while Luna, Terra, and Sol have materially different shared-lane consumption and capability. Cost alone cannot grant architecture, security, or acceptance authority. Conditional Daybreak and Fable gates preserve specialist and provider-diverse review without imposing them on routine low-risk work.

Rejected alternatives: one fixed high-cost model sequence for every task, unrestricted Spark implementation, always choosing the cheapest standard-lane model, silent substitution on unavailability, treating same-provider review as independent-provider review, and transferring Sol authority to a lower route.

Affected constraints: HARNESS-008 FR-017 through FR-026 and SC-009 through SC-014; the superseded schema-2 routing policy; model-selection guidance; greenfield and private-adoption propagation; root-router line budget; read-only review and fail-closed authority invariants.

Reopening condition: official model capabilities, pricing, availability, or provider contracts materially change, or repository-specific evaluation demonstrates that an eligibility boundary no longer preserves verification or authority.

## 2026-08-26 — Route across controller-discovered providers and review pipelines

Decision: replace the fixed vendor catalog with a controller-neutral inventory contract. The active controller reports every model it can execute; selection chooses the lowest-cost eligible builder, then applies distinct code or content review pipelines. Security-sensitive code requires code review, security review, and final acceptance.

Rationale: a controller such as Hermes can expose Codex and Claude together, while OpenCode can expose Fireworks and other providers. The harness must optimize over that actual pool without assuming a vendor from a model name.

Rejected alternatives: hard-coded model catalogs, direct provider API calls from the harness, and automatically granting a newly discovered model planning or final-acceptance authority.

Affected constraints: `harness/model-routing.json` schema 4, controller inventory validation, repository/work classification, distinct-model review stages, cross-provider reviewer preference, and greenfield/private propagation.

Reopening condition: a controller integration provides a portable authenticated discovery protocol that can be adopted without storing credentials or accepting feature-defined shell commands.

## 2026-09-01 — Make continuation boundaries owner-selectable

Decision: provide task, feature, and bounded-features execution modes. Feature
mode is the default; multi-feature mode requires a finite owner-supplied limit.
Task checkpoints are read-only and return a machine-readable stop/continue
decision for the active agent host.

Rationale: owners need to choose between short recoverable turns and sustained
feature work without relying on conversational persistence. The boundary must be
explicit while WIP=1, dependency checks, and commit-bound evidence remain
enforceable.

Rejected alternatives: an unbounded loop, automatic commits, silently activating
the next feature, and treating agent-process lifetime as repository authority.

Affected constraints: execution-policy and session schemas, `bin/agent-session`
start/checkpoint behavior, adoption propagation, and the semantic harness
version, incremented to 1.1.0.

Reopening condition: a provider-neutral orchestrator contract can safely own
feature transitions and commit handoffs without weakening repository evidence or
user-work preservation.

## 2026-09-01 — Refresh the bundled Spec Kit integration

Decision: pin the repository-managed Spec Kit workflow and Codex skill integration to the official `specify-cli` 1.0.0 release. Upgrade the shared templates and scripts with the versioned CLI, include the newly required shared files in the adoption manifest, and keep the repository's feature-specific state outside the managed scaffold.

Rationale: the policy-driven execution pipeline will depend on current specification, planning, task, and implementation workflows. A pinned official release keeps greenfield and brownfield installations reproducible while the manifest and integration checks make the upgrade visible and recoverable.

Rejected alternatives: continue using the 0.15.2 scaffold, follow an unpinned development checkout, replace the repository's active feature artifacts, or install the refreshed files without updating adoption and manifest validation.

Affected constraints: `.specify/init-options.json`, `.specify/integration.json`, the Codex and Spec Kit manifests, managed Speckit skills/templates/scripts, `harness/adoption-manifest.json`, and the adoption contract tests.

Reopening condition: an official Spec Kit release changes the integration contract, the repository adopts a different agent integration, or the policy-pipeline design requires a separately specified workflow extension.

## 2026-09-03 — Continue explicit requests and integrate parallel feature batches

Decision: default sessions to request-scoped continuation. An explicit user instruction such as “continue overnight” is acknowledged without a confirmation question. Independent features use isolated worktrees and sibling `codex/batch/<batch>--<feature>` branches, with a dedicated `codex/batch/<batch>` integration branch. Only fresh integration verification can make a batch release-ready, and merging to `main` remains explicit release authority.

Rationale: conversation-level follow-on intent was not represented by the prior feature-stop default, while parallel writers can conflict in shared files or semantics. Isolation plus a single integration owner preserves progress without allowing unreviewed main-branch changes.

Rejected alternatives: retaining feature-stop as the default, unbounded parallel writes in one checkout, using nested Git ref paths that conflict with the integration branch, and automatic merge or deployment to `main`.

Affected constraints: execution policy, session boundary decisions, adoption propagation, branch/worktree coordination, integration verification, and harness version `1.3.0`.

Reopening condition: a provider-neutral orchestrator supplies durable request scope, resumable process supervision, and independently authorized release integration that can replace this repository-owned batch contract without weakening evidence or owner control.

## 2026-09-06 — Select request-mode successors automatically

Decision: when request-mode work completes its active feature, select the next
priority-ordered not-started feature whose dependencies are satisfied after the
active feature passes. A manually supplied follow-on queue remains a stricter
request scope, but is no longer required for default continuation.

Rationale: request mode had been documented as continuing through the requested
work, but its checkpoint returned `STOP_AFTER_REQUEST` unless an agent
independently supplied `--follow-on`. It also evaluated successors before
treating the completed feature as passing, preventing normal dependency chains
from continuing.

Rejected alternatives: requiring every agent host to build an identical
follow-on queue, marking task checkpoints as feature-state mutations, automatic
commits, and automatic main-branch integration.

Affected constraints: request-mode checkpoint decisions, dependency selection,
the commit-bound evidence handoff, installed-harness propagation, and semantic
harness version `1.4.0`.

Reopening condition: request scope gains a durable owner-provided feature set
that supersedes priority-ordered eligible successor selection.

## 2026-09-08 — Guard local commit continuation without publication authority

Decision: HARNESS-013 may use a typed, code-enforced local `commit` and pinned
`advance` boundary. New request sessions default to continue/agent review;
manual commit and human review are explicit stops. A durable controller-stage
record may resolve only the named independent-review gate after the required
pipeline stages are current and distinct. It is an assertion of a real
controller outcome, not proof of agent identity.

Rationale: a text handoff that asks a model to commit leaves the important
authority decision to interpretation. The guarded boundary instead checks
current receipts, owner-baseline/index scope, exact request queue, an isolated
prepared index, and a ref compare-and-swap. It retains exact recovery state and
requires fresh evidence before existing `mark-passing --activate-next` logic.

Rejected alternatives: conversational approval parsing, automatically clearing
human/credential/release/service gates, provider launchers, arbitrary backlog
selection, `--no-verify`, and any push, PR, merge, release, or deployment.

Affected constraints: execution policy/session schemas, local transaction and
recovery checks, model-routing stage requirements, installed harness runtime,
and semantic version 1.6.0. HARNESS-012 remains a separate release-PR merge
gate; this patch neither completes nor bypasses it.

## 2026-09-04 — Scope project verification locks to the worktree

Decision: project-specific verification locks and temporary coordination artifacts must be scoped per-worktree and, where same-worktree concurrency is supported, per run. Contention uses a bounded wait and reports the lock holder and purpose.

Rationale: a machine-global temp lock allowed one checkout's acceptance tests to block an unrelated CoClient checkout for tens of minutes, making a Rails verification run look like a slow documentation check. Isolation and diagnostics preserve exclusivity without silently coupling repositories.

Rejected alternatives: one fixed lock path under the system temp directory, unbounded waiting, disabling all parallel tests, or treating a blocked lock as an excuse to skip verification.

Affected constraints: application test helpers, verification wrappers, temporary snapshot/packaging locks, process diagnostics, and the operating guidance inherited by generated and adopted repositories.

Reopening condition: an OS-level locking facility can provide stronger ownership and cross-process diagnostics portably while retaining per-worktree isolation and bounded failure behavior.

## 2026-10-18 — Make harness distribution a first-install choice

Decision: support `shared` and `personal` harness installations. Shared mode
tracks common runtime and instructions but keeps `.agent-harness/` in local Git
excludes. Personal mode keeps all harness artifacts local through
repository-local Git excludes and does not edit public ignore configuration.
Both modes start with empty per-worktree maintenance state and persist the
selection in `harness/distribution.json`; reapplication refuses a mode switch.
The omitted option retains shared behavior and `--private` remains a personal
alias. Version 2.5.0 records this additive installation contract.

Rationale: contributors can share a common harness when the repository owner
wants it, while an individual can also use the harness without making it a
repository requirement or sharing personal progress.

Rejected alternatives: tracking active harness progress with shared runtime,
modifying `.gitignore` for personal installations, silently converting an
existing installation, or changing application-state and CI ownership.

Affected constraints: greenfield instantiation, brownfield adoption, local Git
exclusion, distribution metadata, and the 2.5.0 adoption documentation.

Reopening condition: the owner requests a supported distribution conversion or
changes which harness assets are repository-shared.

## 2026-10-22 — Complete installed feature work without Git-tracking its state

Decision: installed shared and personal repositories keep feature-ledger,
review, attestation, and completion updates in locally ignored files. Guarded
local transitions use a private recoverable journal and schema-4 evidence
bound to the committed code candidate, signed profile receipts, exact local
review outcomes, the current feature ledger, and the validated distribution
and exclusion contract. Direct template operation retains its existing
commit-bound state transition and schema-3 evidence.

Rationale: excluding feature state only at installation is incomplete if
review validation later reads that state from Git or advancement creates Git
commits for it. Local state must remain usable for recovery and acceptance
without appearing in the target repository's index or commit history.

Rejected alternatives: tracking state in shared mode, storing personal state
in a shared harness commit, synthesizing a Git resolution commit, or treating
focused tests as passing evidence.

Affected constraints: HARNESS-020 FR-003, FR-011, SC-001, SC-007; local
transition recovery, receipt identity, and architecture rule ARCH-008.

Reopening condition: a portable state service replaces repository-local files
and private recovery journals while preserving per-developer isolation.
