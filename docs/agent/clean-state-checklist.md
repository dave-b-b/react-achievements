# Clean State Checklist

Last simplification review: 2026-09-06. Reassess harness constraints at least every 180 days and remove only constraints that no longer earn their verification value.

`bin/agent-session doctor` checks this cadence independently of the active
feature and of template meta-tests, including installed and terminal-idle
repositories. A review becomes overdue after 180 days (day 180 is still valid).
Missing, invalid, future or overdue review dates return a nonzero diagnostic
naming this file. Cadence diagnostics use fixed text, not checklist contents or
arbitrary contract errors.

Doctor reports only: it never edits the date, removes constraints, cleans owner
work, or changes Git/session state. An overdue report requires an actual review;
record its real date and any justified changes explicitly. This acceptance
repair did not perform a simplification review or refresh the date above.

- [ ] Standard initialization remains viable.
- [ ] Required verification profiles have current receipts.
- [ ] `check-artifacts` reports no ignored invocation-owned caches, bytecode, coverage, or test-result artifacts.
- [ ] Feature status distinguishes passing, blocked, and unverified truthfully.
- [ ] Durable progress and next action are current.
- [ ] No unexplained worktree changes or invocation-owned temporary artifacts remain.
- [ ] External gates and unavailable environments remain explicit.
- [ ] A fresh session can continue without chat context or manual repair.
