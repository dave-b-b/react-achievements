# Controller preparation

Personal installations keep their runtime under `.agent-harness/`. The root
`AGENTS.md` and owner documentation belong to the repository owner, so an
upgrade does not replace them. Use this managed guide when the active
controller needs to resume a repository session:

The authenticated local OS owner and the owner-approved active controller are
trusted for this workflow. Repository content, model output, candidate data,
and copied launch material are untrusted. Profiles and one-use tickets protect
lifecycle attribution and replay; they do not treat another process already
acting as the same authenticated owner as an attacker.

1. Read `.agent-harness/harness/model-routing.json` and
   `.agent-harness/docs/agent/model-selection.md` and
   use the controller inventory already pinned by the active controller.
2. If the repository has no current local inventory, run
   `.agent-harness/bin/agent-session local-controller-record --run-id RUN_ID --inventory
   INVENTORY_JSON --publish-profile` with the exact validated inventory.
3. Run `.agent-harness/bin/agent-session controller-prepare`. It imports the authenticated
   cross-repository profile, validates the current feature route, and prints a
   fresh launch environment containing a protected one-use ticket bound to the
   prepared feature ID. If activation
   or terminal revalidation starts with no active feature, run
   `.agent-harness/bin/agent-session controller-prepare --item FEATURE_ID` for
   that declared lifecycle target. Preparation is availability only and reports
   `execution_confirmed: false`.
4. Launch the selected builder with every value from `launch_environment` in
   its environment. The builder starts the repository session with
   `.agent-harness/bin/agent-session start --preserve-dirty --item FEATURE_ID --restart`.
   The harness consumes the ticket for that exact feature and records execution
   identity only from that actual launch. A copied, replayed, or cross-feature
   environment is refused.

For controller labels `codex-collaboration` and `local-codex`, schema-5 policy
requires `openai/gpt-6.1-sol` for planning and code review. A controller may run
`.agent-harness/bin/agent-session route --binding-source local --stage planning` before launch;
the result is advisory, read-only, execution-unconfirmed, independent of later
review gates, and does not change private state. If Sol is absent or ineligible,
planning or code review blocks without an Astra fallback. Builder routing remains
lowest-cost eligible, while security and distinct final authority retain their
independent strongest-eligible ranking.

Never ask the repository owner to re-enter the controller inventory or to
paste launch JSON. If the profile is absent, malformed, stale, or unsafe, stop
and ask the active controller to publish a fresh profile from its validated
inventory. If an active session pins a conflicting inventory, preserve it and
resume that session through its existing controller.
