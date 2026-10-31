# Repository Agent Operating Contract

## Purpose

This repository is governed for long-running coding-agent work.
Repository artifacts, executable checks, and retained evidence outrank conversation history.
The goal is reliable completion and recoverable handoff, not maximum code output.

## Clock in

1. Confirm the repository root and inspect complete Git state.
2. Read `ARCHITECTURE.md`, `PROGRESS.md`, and `feature_list.json`.
3. Read `docs/agent/README.md` and the sole active execution plan.
4. Read relevant product contracts and `docs/decisions/README.md`.
5. For substantial feature work, read `.specify/feature.json` and its selected spec, plan, and tasks; create or select them with the installed Spec Kit skills when absent.
6. Run `./init.sh`; it runs install/start plus fast static and documentation readiness. Repair a broken baseline before feature work; run the full configured suite once against the frozen final candidate before handoff.
7. Run `bin/agent-session doctor` and resolve contradictory authority.
8. Start with `--preserve-dirty`, or `--require-pristine` for certification.

## Scope and state

Each implementation agent and worktree owns exactly one `in_progress` feature.
Multiple requested features may run concurrently in isolated worktrees, with
one writer per feature/worktree and controller-recorded assignments. Read-only
reviewers do not take writer ownership. Work only on the assigned feature's
declared behavior and expected path surface.
Do not mix optional changes or unrelated work into requested commits. Only after
all requested work is complete may relevant optional enhancements use separately
recorded, revertible local commits under the authorization boundary below.
Preserve pre-existing work and concurrent edits you did not create.
Feature state is authoritative in each worktree's `feature_list.json`; batch
records track ownership, not passing. Only the integration coordinator combines
reviewed candidates and publishes completion after combined verification.
A blocker must be explicit, actionable, and retained for the next session.
This template keeps its application ledger and Spec Kit pointer at the repository
root for compatibility. A separate harness state domain is available only when
explicitly selected with `--state-domain harness`; it is isolated under
`.agent-harness/` and never activates application-domain features.

## Authorization boundary

Before substantive work, capture the requested outcome, included/excluded scope,
and any stated budget in the active plan or `PROGRESS.md`; detailed operating
guidance lives in `docs/agent/README.md`. `continue`, automatic local commits,
parallel work, and DRY/SOLID/YAGNI do not widen authorization or weaken required
verification. Implement and verify the entire requested scope first, using the
existing authorized guarded local-commit rules. Only afterward may relevant
optional enhancements use separately labeled, independently revertible local
commits; report them at the end. Once scoped acceptance is satisfied, complete
the authorized handoff. This compact rule is detailed in the agent README.

## Commands and tools

Canonical commands are reviewed argv arrays in `harness/project.json`.
Feature data cannot provide shell commands or weaken verification.
Use `./init.sh` for initialization and fast static/docs readiness. During
template development, use `bin/test-fast affected` for deterministic mapped
test feedback; unknown paths select the full suite and focused runs create no
completion evidence. For final evidence, run
`bin/agent-session verify static harness docs` once against the frozen
candidate. Do not run a separate `bin/verify all` for that candidate; when a
feature session is active, `bin/verify all` routes to the same signed profile
path and exact successful receipts are reused for an unchanged candidate.
Use `docs/agent/adoption.md` and `bin/agent-adopt` for non-destructive installation into an existing repository.
Use `docs/agent/feedback-promotion.md` to turn repeated review findings into a named architecture rule and executable check.
Use `docs/agent/measurement.md` for privacy-safe cold-start and recovery measurements; measurements never grant completion authority.
Use the installed Spec Kit skills for specification, clarification, planning, and task decomposition. Spec Kit owns design artifacts; the harness owns execution state, verification evidence, and completion eligibility.
Before selecting or delegating a model, read `harness/model-routing.json` and `docs/agent/model-selection.md`. Reuse the active controller's already-pinned inventory; do not ask the user to provide it again. If it is absent or stale, stop before profile execution with the specific recovery action. Use the owner-approved repository/work classification. Choose the lowest-cost eligible builder, then complete every distinct read-only review stage required by the applicable code or content pipeline. Discovery never transfers authority or lets a builder redefine an approved plan.
For authenticated controller inventories labeled `codex-collaboration` or `local-codex`, route planning and code review to `openai/gpt-6.1-sol`; absence or ineligibility blocks those purposes without an Astra fallback. Planning is advisory, read-only, and never execution evidence. Other controllers select their strongest eligible code reviewer dynamically. Security and final-authority routing remain independently ranked, and final authority remains distinct from every earlier model.
The active controller owns inventory recovery: publish or refresh its private profile with `local-controller-record --publish-profile`, then run `controller-prepare` in the target repository and launch the returned builder envelope. When activation or revalidation starts from a repository with no active feature, prepare the declared lifecycle target with `controller-prepare --item FEATURE-ID`. Never ask the owner to re-enter model inventory or provide launch JSON. Preparation is routing only (`execution_confirmed=false`); the active controller must perform the actual launch with the fresh environment values it returns.
Use `bin/agent-session review-preflight` before final verification to validate bound builder attribution, prove the configured review adapter is runnable, and print the ordered dispatch manifest; route output is never execution evidence. Freeze the candidate, run `bin/agent-session review-dispatch --precommit --task Txxx`, and repair until every configured code, security or editorial, and final-authority review accepts those exact bytes. Final authority accepts the candidate subject to the declared signed profiles passing. Only then run `bin/agent-session verify PROFILE...` once. Agent-review verification refuses before profile commands unless builder attribution, adapter readiness, and the complete candidate-bound review pipeline are current. The guarded commit records the exact reviewed and tested tree; `advance` promotes those same review records to the identical commit without another model launch. Do not ask the user whether to launch these already-required review stages.
Use `bin/agent-session metrics` to inspect durable outcome metrics.
Classify the user's request immediately with `bin/agent-session intent --prompt TEXT` and acknowledge the intent without asking for continuation confirmation. The default `request` mode continues through explicitly requested work; use `task` or `feature` only when the user explicitly limits scope, and use bounded `features` only for a declared feature count. Checkpoint completed tasks with `bin/agent-session checkpoint --task Txxx`. In a request session, use the typed `review`, guarded `commit`, and pinned `advance` commands for local continuation; manual-commit and human-review selections are explicit stops.
Template requests may run in parallel through `bin/agent-batch`; prepare each
worker's feature/spec scope before launch. Confirm actual startup, retain the
agent identifier, and resume incomplete work or route review findings for repair.
Queued launches and finished turns are not feature completion. Installed
application repositories remain serial until batch tooling is distributed.
Main-branch merges remain explicit release authority.
HARNESS-012 is a required gate before any release pull request may merge; it is not deferred by this interim scope.
Application unit and E2E profiles remain unavailable until genuinely configured.

## Definition of done

Target user-visible behavior must exist and be exercised.
Every declared profile and required verification layer must pass.
Evidence must match current requirements, commands, tests, and governed files.
Application startup, side effects, cleanup, and applicable E2E journeys must pass.
External gates must be resolved by their actual authority.
Durable progress, decisions, outcome attribution, and next action must be current.
`finish --check-only` must report an eligible handoff verdict.
A handoff verdict is not merge, release, deployment, or self-approval authority.

## Failure loop

On failure: execute, observe, attribute, repair the responsible layer, and rerun.
Use one category: task specification, context, environment, verification, or state.
Record significant failures and recoveries with `record-outcome`.
Never hide a failure by changing tests, commands, feature state, or evidence.
Missing tools, credentials, platforms, services, or reviews remain nonpassing.

## Clock out

Run all required profiles and inspect their per-check outcomes.
Update `PROGRESS.md`, decisions, blockers, risks, and the ordered next action.
Run `bin/agent-session finish --check-only` without mutating the worktree.
Only after a pristine committed baseline, current signed receipts, and closure of every external gate may `python3 script/harness.py mark-passing` create immutable commit-bound evidence. Never hand-edit `passing` or its evidence.
Never silently clean, stash, reset, revert, delete, or overwrite user work.
The only permitted stash exception is an explicit, journaled owner pause/resume
operation that records the exact stash commit and recovery context; ordinary
startup, verification, finish, and error handling preserve work in place.
The guarded local commit boundary is the sole executable exception to the normal no-commit rule. Push, PR, merge, release, deployment, and self-approval remain forbidden unless separately authorized.
Leave the repository immediately runnable and diagnosable by a fresh session.
