# Feedback Promotion

Status: current
Last reviewed: 2026-10-03

Use this path when an independent review finding recurs or identifies a durable
architecture boundary that existing checks do not enforce.

1. Record the finding in a privacy-safe outcome with one failure layer.
2. Decide whether it is a stable architecture rule rather than a one-off defect.
3. Write a regression test that fails for the rule's absent or weakened behavior.
4. Add an `ARCH-nnn` row to `ARCHITECTURE.md`'s **Executable Architecture
   Rules** table, with the exact `test_...` method name.
5. Implement the smallest behavior or validation change that makes the test
   pass, then run the affected profile and `check-docs`.

The named check must exercise the rule's behavior; a documentation-only test is
not a substitute. The table is deliberately limited to formal, enduring
architecture rules. Ordinary implementation notes and one-off review comments
belong in the plan, outcome log, or decision record instead.

`check-docs` examines every `ARCH-nnn` table row in the formal section, including
rows whose check cell is empty or malformed. Each row must have one
backtick-quoted `test_...` name that exists in the repository's test sources;
duplicate rule IDs and missing test methods are rejected. Ordinary prose and
tables outside the formal section do not declare rules.

The parser checks the declaration and test name, not the quality of a test's
assertions. It does not turn a check into completion authority: normal evidence,
independent semantic review, and external gates still apply.
