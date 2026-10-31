# Harness Measurements

`bin/agent-session measure rebuild-cost` measures a fresh clone through the
first executable harness check. `time-to-first-passing-test` measures a fresh
clone through static verification. Both store only a duration, status-safe
identifiers, source commit, and optional digest in `harness/measurements.json`.

Measurements are diagnostic evidence. They never satisfy verification,
independent review, or passing-transition requirements. Re-run a measurement
after a material change rather than comparing stale values across revisions.

## Manual component ablation

Ablation is an owner-run diagnostic experiment, not an automated agent loop or
a way to weaken the canonical verification profile.

1. Choose one named component and a fixed, synthetic task set. Record the
   source revision, host conditions, sample count, and chosen outcome measure.
2. In separate disposable copies, compare the unchanged baseline with exactly
   that component omitted. Do not alter this repository's authoritative tests,
   completion gates, or feature state to conduct the experiment.
3. Repeat both conditions, attribute failures to their responsible layer, and
   report the observations and limitations. A faster failed task is not an
   improvement. Ablation alone does not identify a root cause.
4. Record an `ablation` entry in `harness/measurements.json` with the existing
   closed schema: `recorded_at`, `source_commit`, a declared ratio `value` between
   zero and one, `unit: ratio`, `method: manual_component_ablation`, positive
   `sample_size`, and `notes_digest` (SHA-256 or null). The ratio's definition
   must be agreed before the trial; never store raw prompts, outputs, environment
   values, paths, or notes in the record. Retain only a public, privacy-reviewed
   interpretation in the experiment's authorized documentation.
5. Validate the proposed record with `bin/python script/harness.py check` and
   rerun all required canonical profiles on the unchanged acceptance setup.

No `measure ablation` command is provided. These records do not establish
completion, authorize a model run, or replace independent review.
