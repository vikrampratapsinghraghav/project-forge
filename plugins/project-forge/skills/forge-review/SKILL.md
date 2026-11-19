---
name: forge-review
description: Review current changes against the project's rules before committing or opening a PR — runs verify, the architecture-guardian and design-guardian agents, and optional pr-review-toolkit / code-simplifier. Use when the user says "/forge-review", "review my changes", "check before commit", or "is this ready".
---

# /forge-review — check changes against the project rules

1. Get the change set: `git diff --stat` plus `git diff` against the base branch (default `main`); include untracked files.
2. Run the project's verify command from `.forge/config.json` (`verifyCommand`). If it fails, stop and report the failures first.
3. In parallel, run:
   - **architecture-guardian** agent on the changed files
   - **design-guardian** agent if any UI files changed
   - **security-guardian** agent if auth, data access, API/route handlers, env/config or dependencies changed
   - **performance-guardian** agent if dependencies, data fetching, queries or list/screen rendering changed
   - `pr-review-toolkit` test/error-handling reviewers if available
4. If `code-simplifier` is available, ask whether to run it on the changed files (never change behaviour).
5. Report in this format, most severe first, max 10 items:
   - **Blocking** — breaks a rule in CLAUDE.md / ARCHITECTURE.md / DESIGN.md, missing tests, security issue
   - **Should fix** — duplication, unclear naming, missing edge case
   - **Nit** — style only
   Each item: `file:line — problem → fix`.
6. Offer to fix the blocking items. If a finding reveals a missing rule, suggest `/update-rules`.
