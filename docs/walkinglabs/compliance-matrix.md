# WalkingLabs Harness Engineering Compliance Matrix

## Source authority

- Published curriculum: <https://walkinglabs.github.io/learn-harness-engineering/en/>
- Source repository: `walkinglabs/learn-harness-engineering`
- Immutable source revision: `e587e4cce9cfe9b0523fd79d6e0152d4a1f1dfc3`
- Pin review: on 2026-08-06, the repository deliberately remained at the immutable revision above, whose English source contains thirteen lectures. Newer upstream material, including lecture 14, is not represented by this matrix and requires a separate reviewed feature.
- Executable pin: `harness/project.json`; `test_repository_contracts_are_current` rejects any silent change to the source name, URL, or commit.

This matrix is a status contract for the thirteen lectures at the pinned revision. Reachable commands, red-capable tests, current receipts, and independent review outrank prose.

| Lecture | Reusable base contract | Executable evidence | Base status | Downstream gate |
|---|---|---|---|---|
| 01 — Reliable execution | Explicit task, context, environment, verification, state, and five-layer failure attribution | `feature_list.json`; `harness/outcomes.json`; `test_durable_outcome_log_and_metrics_are_executable`; `record-outcome`; `metrics` | strong | Classify application failures against the same five layers |
| 02 — Five harness subsystems | Routed instructions, fixed-argv tools, repeatable environment entrypoint, durable state, and feedback receipts | `AGENTS.md`; `harness/project.json`; `init.sh`; `test_feature_data_cannot_supply_shell_commands`; `test_receipt_schema_is_allowlisted_and_private` | strong | Configure actual install/start and application profiles |
| 03 — Repository as system of record | A fresh session can recover purpose, architecture, execution, verification, progress, and next action from repository files; the five-question authority registry makes missing context measurable | `harness/recovery-questions.json`; generated `docs/agent/fresh-session-checklist.md`; `doctor`; `measure knowledge-visibility-gap`; `test_knowledge_visibility_gap_detects_a_missing_answer`; adoption and instantiation regressions | strong | Replace or merge product authorities and keep them current |
| 04 — Instruction architecture | Root instructions remain a compact router and registered focused authorities remain link-valid; generated routing documentation is byte-deterministic and stale output is rejected | `AGENTS.md`; `docs/README.md`; `test_root_agents_file_stays_a_compact_router`; `test_generated_docs_are_deterministic`; `check-docs` | strong | Independent semantic-contradiction review remains external |
| 05 — Cross-session continuity | Session retains baseline, mode, work item, receipts, decision records, blockers, progress, and exact next action without relying on chat | `PROGRESS.md`; `docs/agent/session-handoff.md`; per-session receipt namespaces; `trace`; `test_session_modes_receipts_and_unexplained_delta_are_executable` | strong | Update progress after durable milestones and before handoff |
| 06 — Initialization phase | Initialization runs configured install then start commands in order, propagates failure, and verifies configured profiles; existing repositories have a manifest-driven, read-only-plan-first adoption path | `init.sh`; `bin/agent-adopt`; `harness/adoption-manifest.json`; `test_initializer_executes_configured_install_and_start_argv`; `test_entrypoints_resolve_root_from_arbitrary_caller_directory`; `test_adopt_is_idempotent` | strong for base | Real dependency install, startup/readiness, and first application test are mandatory adoption gates |
| 07 — Task boundaries | WIP=1, strict behavior surface, dependency DAG, fixed profiles, unexplained-delta rejection, and derived Verified Completion Rate | `feature_list.json`; `measure verified-completion-rate`; `metrics`; `test_verified_completion_rate_is_derived_and_non_authoritative`; session delta regressions | strong | Declare every application source/test/generated path before work |
| 08 — Feature lists as primitives | Strict recursive schema; harness-controlled passing; retained commit-bound evidence; diagnostic measurements cannot change state | `validation_errors`; `mark-passing`; `harness/measurements.json`; `test_measurements_never_gate_passing`; `test_passing_transition_requires_receipts_and_immutable_source_commit` | strong | Repository-writer identity still requires external reviewer/signature where provenance matters |
| 09 — Termination authority | Completion is conjunctive and externalized; missing, stale, unavailable, unbaselined, or open-gate evidence remains nonpassing | `finish --check-only`; `test_verdicts_never_claim_completion`; `test_receipts_require_complete_chronological_and_strict_namespace_semantics`; `test_application_profiles_fail_unavailable_until_configured` | strong | Technical release readiness is model-owned; explicit publication and unrelated external gates remain separate |
| 10 — Full-pipeline/E2E verification | Every configured profile is selected dynamically and a disposable sentinel profile proves execution plus failure propagation; every formal architecture row requires a valid named check, without treating ordinary prose as a rule; unavailable system/E2E profiles fail explicitly | `bin/verify all`; `docs/agent/feedback-promotion.md`; `check-docs`; `test_declared_architecture_rules_have_named_checks`; `test_template_doctor_cadence_and_formal_rule_cli_are_read_only`; behavioral `test_all_lane_selects_every_configured_profile`; `app-unit` and `app-e2e` profile contracts | strong mechanism | Each application must wire a real compositional journey that can fail while isolated tests pass; independent review must assess the named check's actual behavior |
| 11 — Observability | Live output plus privacy-safe per-check status, duration, command/output digests, session correlation, ordered decision digests, durable outcomes, and bounded infrastructure failures | `run_command`; signed receipts; `trace`; sprint contract; `test_decision_records_are_allowlisted_and_private`; `test_sprint_contract_is_required_and_profile_bound`; `metrics` | strong | Add stack-specific health, runtime, side-effect, and artifact signals |
| 12 — Clean handoff | Pristine and attributed-dirty modes preserve existing work, reject unexplained drift, govern artifacts, never clean/reset/stash/commit, and report actionable simplification cadence independently of feature/meta-test selection, including installed and terminal-idle repositories | `check-whitespace`; `check-artifacts`; `doctor`; `test_overdue_simplification_review_is_reported`; `test_terminal_idle_doctor_cadence_preserves_retained_request_and_session`; `test_installed_doctor_cadence_preserves_owner_git_and_session_bytes`; `test_doctor_cadence_does_not_expand_sprint_contract_selection`; `test_template_doctor_cadence_and_formal_rule_cli_are_read_only`; `test_harness_sources_do_not_contain_destructive_git_operations`; symlink/race/publication regressions | strong mechanism | Perform a real simplification review before updating its date; use pristine mode for immutable certification and attributed-dirty mode for ordinary work |
| 13 — Loop engineering | Goal, stopping condition, current external state, bounded execution, and maker/checker separation are explicit | sole active plan; `finish --check-only`; timeout/process-group controls; independent-review gate; `test_harness_tests_and_ci_are_bound_to_the_evidence_surface` | strong primitives | Autonomous/parallel writers remain conditional and require bounded rounds, isolated worktrees, and fresh checkers |

## Reusable-base acceptance boundary

The template is suitable as a basis for another repository only when all of these remain true:

1. `python3 -B -m unittest discover -s test -p 'test_*.py'` passes with the measured count and no skips in a primary repository.
2. `bin/verify all`, `check-docs`, `check-artifacts`, and `git diff --check` pass.
3. `script/instantiate.py` removes predecessor identity, `.git`, sessions, receipts, attestations, outcomes, inherited measurements, and invocation artifacts.
4. Template→A→B and application→B disposable paths pass generic verification without stale authority.
5. Current evidence is reviewed on immutable bytes; a prior review does not approve later remediation.
6. The base core, application gates, external gates, and conditional autonomous-loop controls are reported separately.

## Mandatory downstream instantiation gates

A generated repository is not application-ready until it configures and proves:

1. dependency installation and application startup/readiness from a fresh checkout;
2. at least one real application unit or behavioral test;
3. a real integration/E2E user journey;
4. stack-specific architecture, security, side-effect, cleanup, concurrency, and isolation invariants;
5. runtime observability appropriate to the selected stack;
6. an immutable committed baseline when the repository owner authorizes it;
7. independent review and every applicable credential, device, service, legal, release, and deployment authority.

Unconfigured profiles are unavailable, not skipped or passing. A passing base harness does not imply application readiness.

## Bounded deviations

- Dirty work is attributed and preserved; the harness never manufactures cleanliness by deleting, stashing, resetting, reverting, or committing.
- Receipts retain strict privacy-safe metadata and output digests rather than raw traces.
- Passing is a harness-controlled immutable-source transition; selecting a successor is explicit through `mark-passing --activate-next`, never automatic.
- Autonomous commits, pushes, PRs, merges, deployments, and parallel writer loops are not granted by this base.
- Semantic contradiction review and independent acceptance remain external rather than self-certified local checks.

## HARNESS-005 security-sensitive regression evidence

The 2026-09-07 increment adds the following named checks. Final profile receipts
and review status are recorded in `PROGRESS.md`; the presence of a test alone is
not completion evidence.

- Lectures 05 and 11: `test_record_outcome_refuses_unsafe_prospective_document_without_writing_or_echoing`, `test_record_outcome_refuses_high_confidence_credentials_without_writing_or_echoing`, and `test_trace_rejects_unsafe_malformed_and_foreign_namespaces_without_raw_rationale` cover refusal before durable publication, generic diagnostics, and private digest-only trace output.
- Lectures 06 and 12: `test_greenfield_inventory_skips_ignored_env_before_refusing_nonignored_credentials`, `test_greenfield_public_and_private_sources_refuse_sensitive_paths_before_copy`, `test_instantiation_and_adoption_sensitive_path_policies_match`, and `test_public_and_private_installations_are_complete_and_nonrecursive` cover installation privacy and the harness self-test boundary.
- Lectures 07 and 09: `test_execution_modes_report_read_only_task_boundaries` and `test_task_ids_only_affect_requirement_digests_when_declared` cover explicit task ownership, stale session scope, and unchanged historical requirement digests.
- Lectures 11 and 13: `test_keyboard_interrupt_reaps_the_owned_process_group` and `test_source_read_failure_escalates_and_reaps_the_process_group` cover bounded owned-process cleanup, including a descendant that ignores termination.

Review follow-through is exercised by
`test_startup_interrupt_reaps_exact_owned_process_without_touching_unrelated_process`,
`test_checkpoint_uses_one_task_scope_snapshot`,
`test_task_scope_rejects_symlinked_pointer_directory_and_ledger`,
`test_ignored_directories_are_pruned_and_surrogate_special_names_are_refused`, and
`test_adoption_refuses_planned_source_content_or_symlink_substitution_before_publication`.
These cover interruption during setup, consistent local task authority, ignored
directory boundaries, and adoption's planned-bytes-to-published-bytes invariant.

Live output remains raw and is not universally redacted. Credential filename and
signature checks are deliberately limited; they do not certify arbitrary source
contents or downstream logging systems. Controller availability, review
identity, and release authority remain external gates.

## HARNESS-011 parallel delivery evidence

The 2026-09-18 ownership amendment scopes WIP=1 to each implementation worktree.
`test_parallel_worker_scopes_are_local_and_idempotent` proves independent local
selection without changing the coordinator ledger; duplicate-assignment and
dependency/dirty-state regressions enforce preparation boundaries. Worker
sessions cannot widen scope or publish final passing. A controller must confirm
actual startup and collect results; queued tool calls are not completed work.
These checks do not close HARNESS-011's integration or external review gates.

The template's batch runtime is request-bound and keeps each worker in a
separate Git worktree. `create --request REQUEST-ID` persists creation intent
before creating refs, `dispatch` overlaps dependency-ready workers by default,
and explicit `serial` or `single` strategies remain request settings. Workers
stop at `awaiting_review` / `ready_for_integration`; only the integration
worktree may combine reviewed candidates, and installation refuses an
unfinished, stale, dirty, or unverified batch source.

Executable evidence includes the legacy isolated-dispatch and integration
checks plus schema-2 coverage for default parallel overlap, explicit serial
execution, single-member scope, dependency-wave resumption, controller-neutral
review identity, cancellation descendant cleanup, partial creation recovery,
request/dependency binding, and installation refusal for incomplete, stale,
dirty, or unverified source state. The focused batch suite currently contains
14 tests. The runtime remains subject to a configured real controller,
independent code/security/final-acceptance review, and terminal combined-result
certification; these local checks do not lift the completion or installation
hold.
