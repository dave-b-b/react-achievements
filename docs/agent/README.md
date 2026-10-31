# Agent Harness Router

Status: current
Last reviewed: 2026-10-12

## Fresh-session order

Owners can yield a feature with `bin/agent-session pause [--reason TEXT]`.
Pause records the exact stash commit and session context under private Git
metadata. Use `queue show|reorder|suspend|unsuspend` to manage order and
eligibility, `activate --feature ID` to start queued work,
`resume --pause-id ID` to continue paused work, or `archive`/`restore` to keep
work recoverable outside the active queue. Resume retains the stash as a
recovery copy; conflicts and wrong-branch attempts preserve the pause record.
Activation and terminal revalidation validate the durable request execution
boundary, continuation policy, and new session's builder authority before
publishing their lifecycle journal, feature ledger, or Spec Kit pointer. Run
them through the active controller, pass its recorded builder ID and binding,
or explicitly select human review.
If a pause is interrupted, finish it with
`pause --recover --pause-id ID` after checking the recorded branch and stash.
When every feature in the local ledger is passing or superseded and no request
or session is open, `bin/agent-session purge --confirm` archives the complete
ledger in private Git metadata and starts a clean empty queue. It never
renumbers feature IDs or removes specifications. Create the next feature with
the Spec Kit workflow and continue the existing ID sequence; the empty queue
is valid while no feature is selected. Cleanup uses one ledger snapshot for its
eligibility and publication decision, atomically replaces private queue and
archive metadata, and retires an archived terminal session so the next cycle
does not inherit stale session state. Interrupted cleanup can be retried; a
concurrent ledger edit is preserved and blocks publication.
Recovery requires the exact journal-named ledger preimage when the live ledger
is missing, and records a terminal session's identity and recovery path before
retirement. If a process stops after either rename, retry validates and
reconciles only those exact displaced files; missing or changed recovery data
fails closed.
To drop one unwanted queued item, use
`bin/agent-session remove --feature ID --confirm`. This accepts only
`not_started` or `blocked` work with no dependents, pinned request, active
session, or pointer selection. It retains that exact feature record in private
Git metadata and leaves its spec files and all other IDs unchanged.
Completing a bound request may leave unrelated paused work in the repository.
The authenticated terminal event permits that state even when an older,
structurally valid private queue revision predates the completed feature;
pause and suspension authority still has to validate. Without a valid terminal
event, the idle queue rule continues to apply.

1. Confirm the repository root and inspect complete Git state.
2. Read `AGENTS.md`, `ARCHITECTURE.md`, `PROGRESS.md`, `feature_list.json`, and the sole active plan.
3. Run `bin/agent-session doctor` and resolve contradictions before editing.
4. Start in `--preserve-dirty` mode for attributed ordinary work or `--require-pristine` for certification/release.
5. Work only on this worktree's assigned `in_progress` feature and declared path
   surface. Independent features may be active in other isolated worktrees.

`./init.sh` runs configured install and startup/readiness commands, followed by
fast static and documentation checks. It intentionally omits the long
behavioral harness suite. During development in the template, use
`bin/test-fast affected` to select a deterministic set of harness test modules
from staged, unstaged, and untracked paths. Its reviewed mapping reports why
each module was selected; unknown paths fall back to every test module. These
focused runs are feedback only and never create completion receipts. Only
Markdown under `docs/` and `specs/` receives the documentation-only exemption;
machine-readable or executable files there select the full suite unless they
have an explicit reviewed mapping.

For signed final evidence, freeze the candidate and complete its entire
configured review pipeline first. Then run
`bin/agent-session verify static harness docs` once against those accepted
bytes. The harness profile runs every test
module in parallel child processes and reports each module's start, duration,
timeout, and result. Cancellation kills every running shard process group,
including one that ignores SIGTERM, before the outer verifier exits. A
shared handler covers both the canonical full suite and `bin/test-fast affected`
and restores the caller's prior handlers afterward. A successful receipt is
reused only when the active session, candidate binding, profile commands, governed surface, requirements,
and work item still match. Repeating the command on the unchanged candidate
therefore does not rerun successful profiles. While a session is active,
`bin/verify all` routes to that same signed verification path; without an active
session it remains a standalone full check. Do not run both paths for one
candidate or repeat the suite after bookkeeping-only edits. The signed receipt set may carry through only the exact guarded review-resolution
child when its private create-only origin, source, owner baseline, namespace,
commands, governed surface, requirements, and receipts still validate. Public
passing evidence records both the original verification commit and the exact
resolution commit. Any substantive source or acceptance change requires a new
full verification run.

For pause/resume development iterations in this template repository, run `bin/test-fast pause-resume`. This developer-only command is not installed into application repositories because their harness self-tests are not installed.
It executes a fixed subset of lifecycle schema and disposable real-Git tests,
stops on the first failure, and creates no verification receipts. It is a
feedback loop only; run the configured full profiles once on frozen final
bytes before handoff.

## Parallel ownership and continuation

One implementation agent owns one feature and worktree at a time. A controller
may run multiple requested features concurrently, with one writer per worktree;
read-only reviewers are separate. Each worker's ledger and Spec Kit pointer
select only its feature. A batch manifest records assignments and execution
state; it cannot certify feature completion. Duplicate assignments across live
batches are refused. Resume the existing worker instead of creating another.

The template controller can create an explicit request with `bin/agent-batch
request --request ID FEATURE...`, then `create --request ID --batch ID
--base-branch BRANCH`. The source must be committed and clean. `prepare --batch
ID --feature FEATURE` selects a pending worker's local scope and reports its
worktree without claiming an agent has started. Dependencies must be passing
or integrated and their candidate commits present in the worker checkout.

Before a tool launch the controller uses `prepare --claim-id UNIQUE-ID` to
reserve the worker atomically. A second preparation or process dispatch refuses
that claim even when the worktree is clean. After launch, `bind --batch ID
--feature FEATURE --claim-id UNIQUE-ID --run-id ACTUAL-AGENT-ID` records the
tool-returned identifier. Claims never expire or restart automatically: recover
the retained controller before considering another launch. The controller
confirms startup through its status/result tools.
Queued setup is not running; an idle or completed turn is not a passing feature.
Process dispatch separately persists a fresh launch identity before its first
worker effect and passes it as `HARNESS_CONTROLLER_RUN_ID`. An interrupted
`running` checkpoint is not automatically relaunched; explicit cancellation and
retry reserve a new identity and invalidate prior builder/review bindings.
Dispatch also preregisters an ownership record before process construction.
The process and its fresh-session group become recoverable before launch can
return, so cancellation can claim, terminate, and reap a worker even while its
launch call is still in flight; the worker observes that claim and never
signals the group a second time.
Workers use `start --preserve-dirty --item FEATURE --execution-mode feature`.
They may finish tasks and local candidate commits under existing authorization,
but cannot publish `passing`, select successors, or clear their own review gates.

When one terminal passing feature has stale evidence after an authorized
integration or definition change, an owner may use
`bin/agent-session revalidate --feature FEATURE --confirm`. This exact-target
operation first verifies the historical evidence against its source snapshot,
then reopens only that feature and starts a normal feature session. For
installed repositories, that snapshot includes the reviewed local feature
and its original profile commands; later local command changes do not rewrite
past completion evidence. It refuses active work, staged changes, out-of-scope
dirty paths, invalid historical
attestations, and stale evidence on other features. Previous attestations stay
in place. Complete the ordinary verification, review, guarded commit, finish,
and advance flow; the revalidation operation itself does not publish passing
state or perform remote Git operations. If interrupted, rerun the same command
to recover its private journal, or continue with the ordinary start command
when the selected feature is already active.

The controller collects results, reruns failed checks after repairs, sends review
findings back to the responsible worker, and resumes incomplete eligible work.
An unavailable capability or required owner decision is an explicit blocker for
that feature; unrelated dependency-ready workers continue. Do not blindly retry
an unchanged failure. Preserve the worker, assignment and reason for recovery.
Only the integration coordinator combines reviewed candidates and obtains fresh
combined verification/review before completion; publication remains separate.

This is template runtime support. Installed application repositories retain
serial execution until the separate batch distribution gate is satisfied.

Harness adoption supports `--distribution shared` (the compatibility default)
and `--distribution personal`; this choice controls harness visibility.
Application feature state and harness-maintenance state stay local and Git
ignored in both modes. See `docs/agent/adoption.md` for the install contract.

## Intent and continuation

Agents must classify the user's request immediately with `bin/agent-session
intent --prompt TEXT` and acknowledge the resulting intent without asking for
confirmation when continuation is explicit. The default is `request`: continue
through all work explicitly included in the request until it is complete or
blocked. An explicit task or feature limit overrides that default.

## Authorization and anti-feature-creep

Before substantive implementation, the active plan or `PROGRESS.md` must state
the requested outcome, included and excluded scope, and any stated time or work
budget. Treat that record as a closed implementation boundary: `continue`,
automatic local commits, parallel work, and DRY/SOLID/YAGNI do not widen
authorization or weaken required verification.

Necessary correctness fixes and regressions introduced by the authorized task
remain in scope. Optional adjacent improvements and unrequested architecture
changes, platform work, or acceptance criteria do not belong in the requested
core commit; record them separately for deferral or the optional-after-core flow
below, without activating unrelated backlog or a new prerequisite.

Implement and verify the entire requested scope first, then commit that core
result with the existing authorized guarded local-commit rules. Do not insert
optional improvements between explicitly requested features. The requested
commit or commits must stand alone and pass acceptance without an optional
commit; do not relabel a missing requirement or required bug fix as optional.
Only after the requested scope is complete may relevant enhancements use
separately labeled, independently revertible local commits. Do not interrupt
the user for optional-scope approval: provide an end report identifying
requested commits separately from optional commits, with optional rationale and
removal consequences sufficient to revert only those extras. If optional work
is unsafe, cannot be safely separated, would exceed the stated budget, or
requires separate external authority, defer and report it at the end instead of
delaying the core.

Commit isolation is not permission to push, merge, deploy, bypass manual or
human selections, weaken checks, implement unrelated backlog, or perform a
broad platform rewrite. This policy does not authorize arbitrary extras within
an open-ended project: optional work must remain relevant and bounded. Once
scoped acceptance is satisfied, complete the authorized handoff rather than
chasing improvements.

## Continuation boundaries

### Durable request binding

The active candidate is selected by `feature_list.json` and `.specify/feature.json`;
preserved HARNESS-012 tasks and review findings remain authoritative in Spec 012.
The following contract does
not claim release readiness, independent acceptance, or publication authority.

In the template checkout, those paths are application-domain state and stay at
the repository root. Select the separate maintenance queue explicitly with
`bin/agent-session --state-domain harness ...`; its ledger, pointer, specs, plans,
and related state live under `.agent-harness/`. Expected paths for shared code,
configuration, and tests remain canonical Git-root-relative. A domain switch
does not import the other domain's feature or request authority.

A schema-2 feature ledger may reference a closed request definition under
`harness/requests/`. Planning records the requested membership and execution
settings there; narrative instructions cannot enlarge them. Use
`bin/agent-session request-check --request REQUEST-ID` to check the reference
and `start --request REQUEST-ID` to bind it. A ledger with a non-null request
reference cannot opt into legacy continuation simply by omitting that flag.

`bin/agent-session next-action` is a read-only decision, not a completion
assertion. Explicit task/feature limits, manual commits, or human review may
narrow a request; they cannot be widened by editing session settings. A changed
contract invalidates the old binding. Review the changed request before an
explicit restart; normal commit and recovery commands do not rebind it.

Request starts retain a create-only private record of the effective scope and
policy, separate from mutable session bookkeeping. A missing record requires a
reviewed restart, not implicit authority migration. Generated transactions also
retain their exact prepared intent before publishing files. Recovery accepts only
the pinned predecessor/candidate, unchanged contract and history prefix, and
predecessor-or-candidate file bytes; edited owner files or staged content refuse.
Pending terminal bookkeeping is recovered before reporting completion.
An exact committed task-journal transaction whose pristine evidence rotation is
unfinished also recovers before pre-journal receipts are read, even when the
journal is governed verification source. Publishing the new pristine baseline
ends that recovery priority; later stale evidence still refuses normally.

Each mid-feature content commit is followed by a recoverable journal-only state
commit before another task can replace its handoff. The final task is recorded
by feature advancement. These audit commits do not satisfy feature acceptance,
spend another optional-feature allowance, or grant external authority. Reports
retain every content commit separately so optional content can be removed without
discarding the request history or claiming current revalidation.

The legacy behavior below applies to schema-1 ledgers and schema-2 ledgers with
`request: null`. It does not grant durable optional-work or reporting authority.

### Legacy session boundaries

The owner selects a session boundary with `bin/agent-session start`:

- `--execution-mode task` stops after one completed `checkpoint --task Txxx`.
- `--execution-mode request` (the default) continues only through the active
  feature and its exact persisted `--follow-on` queue. When that queue is
  exhausted it stops; it never selects a priority-ordered backlog feature.
- `--execution-mode feature` continues through all tasks in the active feature,
  then stops at the feature handoff.
- `--execution-mode features --max-features N` permits bounded continuation
  across eligible features. `N` is required and must be finite and positive.

`checkpoint --task Txxx` is read-only and returns JSON with the decision, next
task, and only a successor permitted by its execution mode. It never marks a task complete,
changes `feature_list.json`, commits, or bypasses evidence. A request-mode
continuation decision is not a stop: the agent completes the required
commit-bound evidence and activation handoff, then resumes the selected feature.

### Guarded local continuation

New request sessions default to yolo continuation, with typed `continue` local
commits and `agent` review. Use `--guarded` when explicit stops are required;
`--yolo` remains an explicit spelling of the default. `--local-commit manual`
and `--review-mode human` are explicit stops. Yolo is a never-stop operational
mode for eligible work: it forces typed local continuation and agent review.
Product
decisions and external authority gates remain deferred and are reported; prose
cannot bypass typed evidence, scope, or dependency checks. Guarded mode
is opt-in.
Agent review is governed by `harness/review-policy.json`: the default reviewer
must be a distinct, read-only, high-reasoning capability supplied by the active
controller. Local Codex orchestration may record a `local_controller_observed`
identity through `bin/agent-session local-controller-record`; this is an
explicitly lower-assurance local attestation, not a publication authority.
The active controller publishes or refreshes its private cross-repository
profile with `local-controller-record --publish-profile`, then runs
`controller-prepare` in a repository that needs recovery and launches the
returned fresh environment. Never ask the owner to re-enter inventory or supply
launch JSON; the active controller owns preparation and actual launch.
Controllers should route with `bin/agent-session route` before dispatch and pass
the complete protected `HARNESS_CONTROLLER_*` context returned by preparation.
Local startup consumes its feature-bound one-use profile ticket before
publishing execution authority, so copying, replaying, or using the envelope
for another work item does not prove a launch.
Review launches also attest the exact
committed candidate tree and route-provided governed surface digest,
`HARNESS_CONTROLLER_REASONING_EFFORT=high`, and
`HARNESS_CONTROLLER_READ_ONLY=true`. `start` and `review` then derive the
model labels automatically from the pinned inventory and binding. A route is
not execution evidence by itself; a run ID alone remains batch bookkeeping,
and missing launch context remains unconfirmed.
For inventories whose authenticated controller label is `codex-collaboration`
or `local-codex`, schema-5 policy requires `openai/gpt-6.1-sol` for advisory
planning and code review. Use `route --stage planning` before implementation
when a plan route is needed; it is independent of later gates, read-only,
execution-unconfirmed, and state-free. Missing or ineligible Sol blocks planning
or code review without an Astra fallback. Builders remain cheapest eligible;
other controllers choose their strongest eligible code reviewer dynamically,
while security and distinct final authority keep their existing ranking.
An agent-review `start`, including `start --restart`, refuses before replacing
the active session, receipts, or handoff state unless the controller's actual
builder launch context is present. A controller recovering a previously
recorded launch may instead pass that same recorded `--builder-id` and
`--builder-binding`; the harness validates the binding and never infers a
launch from inventory or copies identity from an older session. `doctor`
returns a setup blocker for legacy agent-review sessions whose attribution is
missing or stale. An explicit human-review session does not require builder
attribution.
Before signed profiles, `review-preflight` checks the adapter from
`harness/review-dispatch.json`; signed verification repeats this check before
its first profile command. Precommit dispatch launches every routed review
stage in order. Final authority accepts the exact frozen candidate subject to
the declared signed profiles passing. `advance` automatically invokes
`bin/agent-session review-dispatch` after the final guarded task commit. That
invocation deterministically binds the existing review records to the identical
committed tree and checks the actual session records without launching another model. The
shipped adapter uses Codex CLI in ephemeral read-only mode. Adapter processes
receive a fixed runtime allowlist and do not inherit arbitrary parent secrets.
Other controllers
can use the same bounded argv protocol; their adapter must pass real launch
identity to `review` and must not edit the candidate or Git state. Missing
adapter support blocks before the full test suite, not after it.

After freezing the candidate, run
`bin/agent-session review-dispatch --precommit --task Txxx` before signed
verification. This configured adapter path launches the routed code reviewer
first, then continues through every required security or editorial stage and
final authority. It binds the current HEAD as the base anchor and the
future candidate tree, governed surface digest, and candidate paths to the
frozen working-tree bytes, then records each typed precommit review without
caller-supplied launch identity. The harness rereads the complete ordered
pipeline and rechecks candidate paths, route, and session scope before reporting
success. Signed verification then refuses before its first profile command
unless that exact pipeline remains
current. A custom adapter
must explicitly advertise precommit support; older postcommit-only adapters
fail with an upgrade action. The normal sequence is freeze, `review-preflight`,
ordered precommit dispatch and repair, signed verification once, guarded commit,
and deterministic record promotion in `advance`. Collaboration feedback can inform a repair, but it
is not authenticated review evidence unless the configured adapter records it.
Final review dispatch supplies a cumulative Git baseline and the exact current
feature surface, so reviewers inspect all task commits and relevant files.
Selecting human review is an explicit stop; it cannot be silently
converted into agent approval. Review records include the review-policy digest,
so changing this boundary invalidates prior review evidence.
`review --task Txxx --agent-id ID` records a current distinct-agent assertion,
not proof of a remote identity. `commit` requires current evidence and uses a
prepared isolated index; `recover-commit` finalizes only its exact prepared
commit. `advance` uses only the persisted `--follow-on` request queue and
fresh existing passing checks. When an authorized candidate predates its
session boundary, the owner may run `bin/agent-session adopt-candidate
--confirm`. This archives the prior session, freezes the exact scoped
path/status/content set and branch/HEAD context in private Git state, binds its
digest to the fresh session and owner-baseline authority, and records the owner
decision. Guarded commit accepts only those unchanged bytes and blocks if the
adoption journal is missing or altered. After a material block from any
required review stage on
a committed candidate, append the scoped repair task and restart the same
continuation mode. A new `adopt-candidate --confirm` may retire the old
handoff only when an archived blocked review is bound to that exact HEAD and
the live feature and task ledger still declare the appended repair task.
The new task must extend the prior ordered task list. The failed review stays
archived; the repair needs fresh signed profiles and the ordered reviews.
Installed-local transitions reserve private recovery and rollback names and
the original inode identity in the durable journal before moving state.
`recover-commit` restores only the journal-matching displaced preimage after
interruption and refuses changed or occupied targets, including same-byte
replacements. The staged publication inode is recorded before displacement,
and success requires both that inode and exact payload. Historical local
completion checks use the review policy
from the source commit for shared installs and the bound local authority
snapshot for personal installs, so later policy updates preserve prior results.
Publication rollback checks the invocation-owned inode and exact payload after
cancellation and keeps any concurrent owner edit at its original path. The private
transition journal keeps a fixed backup while changing state, so an interrupted
update restores the prior record or preserves an owner edit.
Staged, out-of-scope, changed, or context-mismatched candidates remain blocked;
adoption never stages or rewrites source files. Precommit review may resolve
the active feature from the frozen candidate ledger when it is absent from
HEAD. Each requested successor must already declare a
safe canonical `spec_directory` under `specs/` and exact ordered `task_ids` in
`feature_list.json`; the commit pins its ledger digest and activation switches
the `.specify/feature.json` pointer only to that scope. None of these commands
push, create a PR, merge, release, or deploy.

Code review evidence also carries a structured quality assessment. It must
declare a `pass`, `pass_with_advisories`, or `blocked` outcome; address DRY,
SRP, OCP, LSP, ISP, DIP, and YAGNI; give reasons for exceptions and
non-applicability; and attach safe concise evidence to every finding. Open
material findings force `blocked`, while open advisory findings remain visible
as `pass_with_advisories`. Review records bind agent mode, request reference,
continuation scope, feature requirements, exact source, and the policy digest,
so any changed input makes the record stale.
Refresh a retained review chain from its earliest stale configured stage. A
replacement truncates downstream authority while preserving and revalidating
the earlier ordered prefix. This includes content editorial/final-only stages;
it does not bypass required code, security, or final review.

Schema-9 sessions containing legacy review data remain readable only for an
archive-preserving restart: migration clears their review authority and any
pending review-authorized commit handoff. Successor or terminal recovery reloads
the exact reviewed retirement descriptor and revalidates its retirement state,
current trusted inventory, and route immediately before the guarded ref update;
a late change refuses before head publication.

The template batch runtime executes request-bound work in isolated worktrees;
installed repositories deliberately omit those template-only tools and remain
serial unless they receive a separately authorized runtime. No installed
command grants integration or main-merge authority. Model `final_authority`
review owns technical release readiness; `release-approval` is not an external
human gate. HARNESS-012 installs this policy. Push, merge, deploy, and
publication still require explicit owner authority.

Batch certification and packaging parse policy, project, routing, review-policy,
and feature-ledger authority only from exact bytes retained by one clean-source
snapshot, which is compared again before publication. A batch builder must match
its current inventory id/provider/model and resolved identity, satisfy the
classification-owned role and capabilities, and have the lowest eligible cost
rank. Review records bind requirement, immutable scope, exact review-policy
bytes, selections, and structured code-quality evidence. Replacing an earlier
stage truncates its downstream review suffix; material findings never advance.

## Five recoverable questions

A fresh agent must be able to answer from repository artifacts: what the system does; who owns each architecture boundary; how to initialize; how to verify; and what feature, blocker, evidence state, and next action are current.

## Profiles

Profiles are reviewed argv arrays in `harness/project.json`, executed directly without a shell. `static`, `harness`, and `docs` are available in the base template. Application unit and end-to-end profiles intentionally fail unavailable until configured. A feature can require only known profiles. External gates can never be satisfied by a local profile.

The template's GitHub Actions workflow is optional. The configured local
profiles and their current evidence determine feature verification; absence of
`.github/workflows/harness.yml` is allowed even when template meta-tests are
enabled. If the workflow is present, template contract checks still validate
its runner, checkout depth, and pinned actions. CI availability or a hosted CI
result is not a feature-completion or pull-request merge gate.

Both direct and session verification validate the project contract before
printing remediation or running commands. Every `unavailable` value must be
safe public text of at most 500 characters; invalid configuration reports a
generic refusal without echoing the untrusted value.

## Project lock discipline

Application-specific tests may need exclusive files, ports, snapshots, or package state. Scope every such lock and temporary coordination artifact to its repository worktree; include a run identifier when concurrent runs in one worktree are supported. Never use a machine-global temp filename that can block an unrelated checkout. Use a bounded wait and, on contention, report the lock holder and purpose so the owner can decide whether to wait, stop the holder, or repair the test design. The harness's own private session state is already per-worktree; application tooling must apply the same rule to its own locks.

## Evidence, outcomes, and verdicts

### Privacy boundary

Live stdout and stderr are **not redacted**. They may be captured by the terminal,
CI service, or agent controller even though the harness stores only digests in
receipts. Reviewed project commands must not print credentials, environment
dumps, request headers, or raw private data. Do not place credentials in argv,
feature descriptions, summaries, or test fixtures; use the project's approved
credential store and synthetic test values. A pattern guard is defense in depth,
not proof that arbitrary prose or source code contains no secrets.

`record-outcome` must validate the prospective record before publication and
reject unsafe text without echoing it. An unsafe decision-record namespace is
an error, not an empty successful trace. Interrupted verification must clean up
its owned processes and must not publish a successful completion receipt.

### Receipt lifecycle

`verify` streams output live but stores only SHA-256 digests and allowlisted metadata under the active session's unique `.git/repository-agent-session/receipts-<session>/` namespace. Each receipt includes every configured check in order, with identity, status, duration, and output digests. Receipts are private, atomically published without replacement, authenticated to the active session, chronologically bounded, and retained in a strict fail-closed namespace. Under the transaction lock, verification validates and identity-binds every existing entry before command execution, again before publication, and immediately after publication; malformed siblings or namespace replacement fail closed. No-replace publication proves that the final target is still the invocation-created temporary inode. If post-publication validation fails, the new receipt is moved with kernel-enforced no-replace semantics and its exact opened regular inode is irreversibly invalidated through the descriptor before any further pathname operation. Cleanup never unlinks a pathname after an identity check. Whatever subsequently occupies the quarantine name—including a regular replacement, symlink, directory, FIFO, or other unsupported type—is moved without replacement into `.git/repository-agent-session/publication-recovery/`; recovery metadata is inspected without opening arbitrary file types, so FIFOs cannot block cleanup. An identity mismatch fails closed and reports the recovery path, preserving unowned bytes and keeping the receipt namespace usable. Colliding quarantine and recovery entries remain byte-for-byte unchanged. General administrative and governed repository-file publication also uses no-replace rename rather than link-plus-unlink; replacement first preserves the prior target in private recovery and restores it if publication fails. Restarts atomically switch to a fresh receipt namespace, so failed session publication preserves the complete prior session and its receipts.

`mark-passing` is the only supported passing transition. It requires a pristine committed baseline, an unchanged active session, successful complete receipts for every required profile, and no external gates. It retains exact privacy-safe receipt content under `harness/attestations/` and writes evidence bound to that content and the immutable source commit. Structural validation requires the retained digest and re-derives command, profile, requirement, check-sequence, and governed-surface semantics from the commit. Evidence without matching retained content, including a fabricated digest, is rejected. Because repository writers can edit both ledgers and attestations, independent maker identity remains an explicit external-review/signing concern rather than a claim made by this standard-library harness.

Record significant success, failure, recovery, and false-completion events with `record-outcome`; the schema-validated repository log uses the five WalkingLabs attribution layers. `metrics` reports feature state, configured-profile counts, results, false-completion claims, and failures by layer. Do not include credentials, personal data, or raw logs in durable summaries.

`finish` runs no checks and changes no files. Its verdict distinguishes clean, attributed-dirty, unbaselined, blocked, and not-clean states, with separate external-gate variants where relevant. Unborn repositories receive `UNBASELINED_HANDOFF` (or its external-gate variant) and a nonzero exit; attributed dirty repositories are never labeled clean. No verdict is a merge, release, deployment, or self-approval authorization.
