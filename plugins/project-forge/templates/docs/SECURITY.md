# Security — {{PROJECT_NAME}}

## Reporting a vulnerability
Please report security issues privately to {{SECURITY_CONTACT}}. Do not open a public issue.

## Baseline
| Area | How it is handled |
|---|---|
| Secrets | Only in git-ignored `.env*`; typed env module validates at startup; hooks block keys in code and un-ignored `.env` files |
| Client exposure | Only `{{PUBLIC_ENV_PREFIX}}*` variables reach the client; never secrets |
| Input validation | zod at every server boundary (route handlers, server actions, API clients) |
| AuthN / AuthZ | {{AUTH_SUMMARY}} — every read/write checks ownership/role |
| Data access | {{DATA_ACCESS_SUMMARY}} (e.g. Supabase RLS enabled on every table; service-role key server-only) |
| Web headers | CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors 'none' |
| Abuse | Rate limiting on auth and write endpoints |
| Dependencies | `audit` in CI; Dependabot weekly updates |
| Logging | Errors logged with context; no secrets or personal data in logs |

## Review cadence
- Every PR: `verify` + guardian agents via `/forge-review`.
- Before each release: `/security-audit`.
- If a secret leaks: rotate it immediately, then remove it from history.
