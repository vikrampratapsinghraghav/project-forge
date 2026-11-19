---
name: security-audit
description: Full security and production-readiness audit of the whole repository before a release — runs the security-guardian and performance-guardian agents repo-wide, dependency audit, secret scan and config checks, then gives a prioritized fix list. Use when the user says "/security-audit", "security check", "is this safe to launch", or "production readiness".
---

# /security-audit — release readiness check

1. **Automated checks** (read-only; report each result in one line):
   - `verify` from `.forge/config.json`
   - dependency audit: `pnpm audit --prod` (or the project's package manager)
   - secrets: confirm `.env*` (except examples) are git-ignored and untracked: `git ls-files | grep -E '(^|/)\.env'`
   - if `gitleaks` or `trufflehog` is installed, run it on the repo; otherwise say it was skipped
2. **Agents, in parallel, scope = whole repo**:
   - `security-guardian`
   - `performance-guardian`
   - `architecture-guardian` (only for structure issues that affect security, such as UI touching data directly)
3. **Production config checklist**: security headers/CSP present, HTTPS only, CORS restricted, debug off, error pages don't leak stack traces, rate limiting on auth/write endpoints, backups/RLS confirmed for the database, logging without personal data.
4. **Report**, max 15 items, sorted Critical → Low:
   `[Severity] area — risk → fix → effort (S/M/L)`
   Then a one-line verdict: `READY`, `READY WITH FIXES (list)`, or `NOT READY (blocking items)`.
5. Offer to fix Critical/High items now, one at a time, each with a test. Suggest `/update-rules` for any rule that would have prevented a finding.

Note for the user: this is a strong automated review, not a replacement for a professional penetration test on apps that handle money or sensitive personal data.
