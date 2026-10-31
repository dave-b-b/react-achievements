# Controller-Agnostic Model Selection

Status: current
Last reviewed: 2026-10-30

`harness/model-routing.json` is the executable authority. The active controller (such as Hermes or OpenCode) supplies an owner-controlled inventory of models it can execute, including provider, cost rank, strength rank, supported reasoning efforts, capabilities, and permitted roles. Discovery establishes availability only; it never grants authority.

For local Codex orchestration, `bin/agent-session local-controller-record` stores the controller inventory and local-observed identity mappings under the explicit `local_controller_observed` origin. With `--bindings` omitted or empty, the harness derives the identity mapping from each inventory provider/model pair and its declared roles; this maps available identities but does not attest execution. A serial session pins either that local namespace or the launcher-attested namespace at start and never reads across the boundary. It remains subject to the same distinct-model, exact-candidate, current-evidence, and no-publication checks; batch certification continues to require launcher-attested records.

The authenticated local OS owner and the owner-approved active-controller process are inside the local orchestration trust boundary. Repository content, model output, candidate data, and copied launch material are outside it. Controller profiles and one-use tickets preserve lifecycle attribution, scope, and replay protection; they do not defend against a hostile process already acting as the same authenticated owner. Repository content cannot invoke controller commands or grant itself controller authority.

Schema 5 adds a closed controller preference owned by the routing policy. When the authenticated inventory controller is exactly `codex-collaboration` or `local-codex`, planning and code review require `openai/gpt-6.1-sol`. The model must retain its declared role, required capabilities, high reasoning, trusted identity, and distinctness; otherwise routing blocks with `required-controller-model-unavailable`. It never falls back to Astra or another provider for those two purposes. Builder selection remains the lowest-cost eligible route. Other controller labels continue to select the strongest eligible code reviewer dynamically. Security review and final authority remain independently ranked, and final authority remains distinct from the builder and every preceding review stage.

`bin/agent-session route --binding-source SOURCE --stage planning` resolves that planning preference independently of later review gates. Planning uses code-review eligibility and capabilities at high reasoning, reports `role: planning`, `assurance: advisory`, `read_only: true`, and `execution_confirmed: false`, and writes no session, receipt, review, inventory, or binding state. A missing later security or final-authority route therefore does not prevent an available planning route.

### Dispatch and automatic attribution

The controller must select before launch and pass the actual launch context to the harness. Register or refresh the owner's private profile with `bin/agent-session local-controller-record --run-id INVENTORY-RUN --inventory JSON --bindings '[]' --publish-profile`; when no explicit bindings are supplied, the harness derives local-observed provider/model identities and role mappings from the inventory. The profile is outside installation payloads, defaults to the user's private state home, and can be relocated with `HARNESS_CONTROLLER_PROFILE_HOME`. In a repository without inventory, the active controller runs `bin/agent-session controller-prepare`, then launches the fresh environment returned in its output. That environment includes a protected one-use profile ticket bound to the prepared feature ID; startup consumes it only for that exact work item before creating local execution authority, and replay or cross-feature use is refused. Preparation records availability and identity mapping, not execution. Never ask the owner to type inventory or launch JSON; profile recovery and actual launch belong to the active controller. Personal-installation upgrades deliver the managed operator copy at `harness/controller-preparation.md`, preserving the owner's root `AGENTS.md` and project documents.

An agent-review `start` or `start --restart` accepts the session only when that
builder launch is bound. The check runs before the harness archives or replaces
an active session or its receipts. Recovery may use the active controller's
launch environment or the same builder ID and binding already recorded by that
controller. The harness does not infer execution from inventory and does not
reuse attribution from an older session. `doctor` blocks legacy unconfirmed
agent-review sessions with this recovery action; explicit human-review starts
remain available without builder attribution.

Before final verification, call `bin/agent-session review-preflight`. It reuses the already-pinned controller inventory and never prompts the user to enter it again. It refuses if the active builder binding is missing or stale, if the full ordered review pipeline cannot be routed, or if the configured adapter cannot launch. Run the complete candidate-bound precommit review pipeline next. Signed verification requires every stage before its first profile command, so review findings stop before expensive work and report the specific recovery action. The repository adapter contract is `harness/review-dispatch.json`; adapters receive a closed candidate-bound manifest and return a bounded JSON result. The shipped Codex adapter uses ephemeral read-only `codex exec` launches. Adapter children receive a fixed runtime allowlist rather than arbitrary parent credentials. Other controllers can provide an executable that implements the same `preflight`, `precommit`, and `dispatch` arguments. The output identifies each routed model and role and deliberately sets `execution_confirmed` to `false` until the actual review record is accepted.
`controller-prepare` routes the sole active feature by default. If activation or terminal revalidation begins while the repository has no active feature, the controller prepares that declared target with `bin/agent-session controller-prepare --item FEATURE-ID` and launches the returned one-use builder envelope before invoking the lifecycle command. The target must be an existing queued, blocked, or terminal passing feature; preparation does not activate or reopen it.
The controller creates a stage-specific ticket and immutable binding before it
launches each reviewer. The adapter passes that exact launch envelope to the
reviewer and the review-record command.
An ID created after model execution does not attribute that execution.

- `HARNESS_CONTROLLER_RUN_ID`
- `HARNESS_CONTROLLER_AGENT_ID` (the inventory model ID returned by `route`)
- `HARNESS_CONTROLLER_ROLE` (`builder` or the selected review role)
- `HARNESS_CONTROLLER_BINDING_SOURCE` (`local` or `trusted`)
- For a local launch: `HARNESS_CONTROLLER_LAUNCH_TICKET` and its exact `HARNESS_CONTROLLER_WORK_ITEM`; review stages also receive the controller-prepared `HARNESS_CONTROLLER_MODEL_BINDING`
- For a review launch: `HARNESS_CONTROLLER_CANDIDATE_TREE`, `HARNESS_CONTROLLER_SURFACE_DIGEST` (both taken from the reviewed candidate and route output), `HARNESS_CONTROLLER_REASONING_EFFORT=high`, and `HARNESS_CONTROLLER_READ_ONLY=true`

With this context, `start` binds the builder automatically and the adapter uses `review --task Txxx --precommit-stage ROLE` before verification, or `--stage ROLE` for compatible older committed sessions, to record the reviewer ID, provider, model, selection, inventory, and binding from the active authority lane. The review context attests the governed surface digest, exact candidate tree, and required execution settings. An explicit ID or inventory that contradicts the launch is refused. A missing, stale, or mismatched launch context is unconfirmed and cannot be inferred from the route. A run ID alone, as used by batch process bookkeeping, does not activate model attribution.

For a dirty frozen candidate, run `bin/agent-session review-dispatch --precommit --task Txxx` before signed verification. The adapter launches the full routed pipeline in order and records each typed precommit assertion with the exact launch envelope used for model execution. Final authority accepts the candidate conditionally on all declared signed profiles passing for those exact bytes. The harness rereads every record and rechecks the future candidate tree, working-tree surface, candidate paths, session scope, and route. It never accepts the adapter result by itself. Repair material findings and repeat affected reviews until the pipeline passes. Signed verification refuses to start without the complete current pipeline, so the full suite runs once against reviewer-accepted bytes. Guarded commit still requires both those reviews and current signed evidence.

On the final task's guarded commit, `bin/agent-session advance` automatically runs no-argument `review-dispatch` before it resolves the handoff. It proves the commit's tree is identical to the reviewed candidate, confirms the signed profiles remain current, and promotes the existing conditional final-authority record to the committed evidence binding. It does not launch a model. A tool response or adapter status never substitutes for the harness review record. Local controller records remain lower-assurance observations; trusted-launcher controllers should install an adapter that carries their signed launch metadata. A controller that cannot expose launch metadata remains unconfirmed.

### Controller adapter protocol

`harness/review-dispatch.json` names a direct argv and timeout. The harness appends one action and the private manifest/result paths:

```text
<adapter argv> preflight --manifest PATH --result PATH
<adapter argv> precommit --manifest PATH --result PATH
<adapter argv> dispatch --manifest PATH --result PATH
```

The `preflight` action returns `{"schema":1,"status":"ready","adapter":"name","phases":["precommit","postcommit"]}` only when it can launch all routed stages and explicitly identifies supported phases. The `precommit` action receives the full ordered route, base HEAD, future candidate tree, exact candidate paths, governed working-tree surface, task, and inventory binding. It returns a phase-bound complete or blocked result. The harness accepts `complete` only after it rereads every corresponding authenticated review record. The no-argument postcommit path performs deterministic promotion for this flow; `dispatch` remains available for compatible older committed sessions. Adapter timeouts, malformed output, candidate drift, or missing records block handoff. Adapter implementation and configuration are reviewed source; manifests and review reports are temporary or private local state.

## Work classification

`harness/project.json` owns `repository_kind` (`unclassified`, `code`, `content`, or `mixed`) and the allowed work kinds. The active `feature_list.json` item owns `work_kind`, `risk`, and `security_sensitive`. An unclassified repository cannot route work, a content repository cannot route code work, and a code-security request cannot be disguised as content. File inspection may suggest a value but cannot override the owner-approved classification.

Schema-2 batch requests copy each selected feature's exact typed classification into an immutable `classifications` map. Each worker copies the same value, and runtime plus packaging refuse a missing, altered, or mismatched request/worker snapshot; neither derives a fallback work kind, risk, or security flag.

## Review pipelines

| Work | Low/standard | High | Security-sensitive code |
|---|---|---|---|
| Code | Cheapest eligible builder, code review, then final authority | Code review, then final authority | Code review, security review, then final authority |
| Content | Cheapest eligible builder, then final authority; editorial review is added at standard risk | Editorial review, then final authority | Not applicable; block contradictory classification |

Every agent review is read-only, runs at high reasoning, and is distinct from the builder and every earlier stage. Codex-controller code review uses the mandatory Sol preference above; other controller labels use the strongest eligible model across their available providers. Security review and final authority always use the strongest remaining eligible model. The first reviewer prefers a provider different from the builder when the mandatory preference does not apply; each later reviewer prefers one different from the immediately preceding review stage. Before ranking, one shared resolved-identity evaluator removes prior agent IDs, trusted resolved-model digests, and provider/model runtime aliases from eligibility. If no eligible high-reasoning reviewer exists, routing blocks; it does not silently remove the gate, downgrade reasoning, or reuse the builder. Technical release readiness is owned by the routed `final_authority` model stage; the retired `release-approval` human gate is not required. An owner may still select human review for a separate explicit boundary, which is never represented as an agent approval.

The accepted review record binds the selected agent mode, request reference,
continuation scope, feature requirements, exact source, and the versioned
review-policy digest. Code/design-quality review uses a structured outcome:
DRY, SRP, OCP, LSP, ISP, DIP, and YAGNI are each addressed, and every finding
includes concise safe evidence. Open material findings block; advisory findings
remain distinguishable. Valid blocked reassessments are retained readably and
revoke prior approval. Code-stage reassessment revokes downstream stages, so
clearance requires a fresh assessment and fresh later reviews. On a refreshed
inventory, the router resolves once and validates the complete retained review
prefix before any session-state write; an earlier stale or rerouted stage blocks
the submitted later stage. Conflicting submissions are rejected before changing
session state. This evidence does not grant integration, release, or publication
authority.

The final-authority stage additionally records an approval, advisory, or
blocked decision, safe findings, the exact routed selection, a validated
controller-inventory snapshot and digest, and the current receipt/evidence
digest. Readiness revalidates the retained snapshot against the current routing
policy; changed inventory, receipt, source, scope, or policy bindings require a
fresh final review. Publication remains separate.

Schema-2 batch certification requires a separate, high-reasoning, read-only
`final_authority` model record. That record is bound to the clean integration
head, the separately retained prefix-verification digest, every per-feature
review receipt, and the verified profile set. Controller-originated resolved
model digests, immutable `trusted_launcher_observed` binding references, and
persisted provider/model runtime pairs are retained for every builder and review
stage. The shared eligibility evaluator excludes a matching prior agent ID,
resolved-model digest, or provider/model pair before ranking; display IDs and
provider/model aliases do not grant separation. Independent features may reuse
one eligible builder, while final authority remains distinct from every prior
stage. A missing, stale, blocked, or non-distinct final decision fails closed.
Runtime and installation packaging apply the same strict durable-text privacy
predicate to inventories, selections, reviewer identities, profiles, and
retained findings. A batch review record additionally carries its zero-based `stage`, exact `reviewer_role`, and per-stage immutable builder/reviewer binding references and resolved digests. It may advance only through the configured ordered pipeline; `ready_for_integration` requires every stage. Content low-risk work has a final-authority-only pipeline, not an absent review requirement. Runtime and packaging enumerate the complete immutable batch binding namespace with the same ambiguity-safe alias semantics before final-authority ranking, so an otherwise unreferenced stronger alias cannot disagree between certification and installation. Every present profile `unavailable` remediation is safe public text of at most 500 characters, even when that profile also has commands.

Batch records require explicit high-reasoning and read-only assertions. Runtime
and packaging reroute every retained stage against current inventory, and bind
the builder to the actual worker launch run. The complete trusted identity map's
builder entry must equal the pinned builder digest; missing or conflicting
bindings refuse even when the selected builder record itself is valid.
The builder's recorded id/provider/model must exactly match its current inventory
entry, hold the classification-owned builder role and the union of role/profile
capabilities, and have the lowest cost rank among all eligible identity-bound
builders. Equal-cost eligible builders remain valid. Runtime review acceptance
and terminal installation packaging call the same evaluator.
Schema-4 policy validation requires code review
first for code work, editorial review for standard/high content work, and final
authority last; stages cannot repeat or move behind final authority.

Schema-2 certification binds the complete batch context and request digest.
Older outer certificates require an explicit fresh `certify` submission. If
review records are stale, submit a new stage-zero `bin/agent-batch review`, then
every later stage. For an integrated candidate this requires the unchanged
clean integration checkout and revokes its certification while retaining its
pinned merge. If that merge has no prefix evidence, refresh retains `blocked`,
not `verified_prefix`. After all stages are refreshed, explicitly retry
`integrate` for that same feature to rerun the required profiles without another
merge; only successful evidence publication restores `verified_prefix`.
These operations never fabricate a review or change publication
authority. Binding namespace membership and identity are rechecked immediately
before runtime effects and packaging success.

Every batch review binds the request requirement digest, immutable feature scope,
the SHA-256 digest of the exact tracked review-policy bytes, exact builder and
reviewer selections, and a structured quality assessment. Code review must
address DRY, SRP, OCP, LSP, ISP, DIP, and YAGNI with evidence-bearing findings;
an open material finding blocks advancement and an advisory produces
`pass_with_advisories`. Non-code stages carry no quality assessment. Submitting
a valid record for any retained stage replaces that stage and truncates its
downstream suffix, which must be reviewed again.

Serial authority uses the same rules: every eligible candidate must have an
unambiguous trusted identity mapping, and the selected binding digest must
equal that mapping. Missing mappings are not eligible. The complete binding
namespace is snapshotted before routing and rechecked immediately before review
publication. Final approval also rechecks its controller-inventory namespace at
that boundary. Readiness reroutes every retained stage, not just final authority,
and reviewer agents must remain distinct from the builder and earlier stages.
The shared pipeline resolver inserts security review only when it is absent.
An explicit submission may replace any retained configured stage and truncate
its downstream suffix. Every preceding stage must still be current and valid;
refresh starts at the earliest stale stage, including `final_authority` for
low-risk content or `editorial_reviewer` for standard/high content. Security
stages and the configured order remain mandatory, and old approval is revoked.

Process dispatch persists a fresh random `controller_run_id` and `running`
checkpoint before dependency merges, scope preparation, or process launch. The
child receives `HARNESS_CONTROLLER_RUN_ID`. An interrupted running checkpoint
requires explicit recovery/cancellation, and an authorized cancelled relaunch
gets a new identity with its old builder/review authority cleared.

Integration requires the exact recorded clean head, not merely the correct
branch. Before merge and final certification publication, runtime revalidates
the actual tracked bytes and identities, Git refs, manifest, request, complete
review/binding/certification/prefix-evidence namespaces, current inventory, and
policy. Late changes refuse instead of publishing stale authority.

Controller inventory reads reject duplicate JSON keys and bind private regular
files to stable, owner-controlled parent directories. Runtime effects and
packaging success recheck the entire consumed namespace. Schema-2 packaging
also authenticates the manifest's policy digest against the current batch
policy and uses the runtime's limits of 16 members and 4 workers. Routing-policy
inventory metadata is typed, bounded safe public text.
