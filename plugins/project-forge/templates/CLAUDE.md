# {{PROJECT_NAME}}

{{ONE_LINE_PURPOSE}}

> Keep this file under ~150 lines. Details live in ARCHITECTURE.md, DESIGN.md and docs/adr/. Update it with `/update-rules`.

## Stack
{{STACK_BULLETS}}

## Commands
- `{{PM}} dev` — run locally
- `{{PM}} verify` — lint + typecheck + tests + dead-code (knip) + size budget (must pass before every commit; enforced by hook)
- `{{PM}} test` — tests only

## Architecture (see ARCHITECTURE.md)
- Layers: `ui` → `logic` → `network` / `data`. Imports only go downward. Never skip a layer.
- UI never calls fetch, SDK clients or the database directly; it uses hooks/use-cases from `logic`.
- External data is validated (zod) at the `network`/`data` boundary; the rest of the app uses typed models.
- Env vars are read only through the typed env module ({{ENV_MODULE_PATH}}).

## Code rules
- TypeScript strict. No `any`, no non-null `!` without a comment explaining why.
- Search before you create: reuse or extend existing functions, hooks and components.
- Small, single-purpose functions and files. Clear names over comments.
- Handle errors explicitly; never swallow them. Show user-friendly states.
- No dead code, no commented-out code, no TODO without an issue link.

## Testing rules
- Every logic/network/data change comes with tests. Bug fix = failing test first.
- Never delete, skip or weaken a test to make it pass.
- Tests live next to the code: `name.test.ts(x)`.

## Security rules (see SECURITY.md)
- No secrets in code or commits. `.env*` is git-ignored; document vars in `.env.example`. (Hooks block keys and un-ignored .env files.)
- Server-only secrets never reach the client bundle (no secrets in `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*`).
- Validate all user and external input on the server (zod). Never trust client-side checks alone.
- Every data access checks **authorization** (who may read/write this record), not just authentication. {{AUTHZ_NOTE}}
- Escape output; no `dangerouslySetInnerHTML` / raw HTML from users. Parameterized queries only.
- Security headers + CSP on web; rate-limit auth and write endpoints; generic error messages to users.
- Add a dependency only when needed; prefer well-maintained packages; CI runs `audit`.

## Performance rules
- Budgets are part of `verify`: {{PERF_BUDGETS}}. Exceeding one is a failing build, not a warning.
- Paginate lists; never fetch unbounded data. No N+1 queries; batch or join.
- Cache deliberately (HTTP cache headers, query cache) and document invalidation.
- Lazy-load heavy routes/components; optimize images (framework image component, correct sizes).
- Avoid unnecessary re-renders: stable props, memo only where profiling shows it helps.
- Measure before optimizing; record the before/after number in the PR.

## Reliability rules
- Every network call has a timeout, typed errors and a user-visible failure state.
- Retries only for idempotent operations, with backoff.
- Error boundary at app/route level; log errors with context, never log secrets or personal data.
- No unused code or dependencies (`knip` runs in `verify`).

## Design rules (see DESIGN.md)
- Colours, sizes, fonts, shadows come from tokens only ({{TOKENS_PATH}}). Raw values are flagged by hook.
- Build screens from primitives in `{{UI_PRIMITIVES_PATH}}`; add a variant before adding a new component.
- Accessible by default: labels, focus states, contrast, 44×44 touch targets.

## Working style
{{WORKING_STYLE}}

## Workflow
1. Non-trivial change → short plan first, then implement in small steps.
2. Keep changes focused; one concern per commit.
3. Before committing: `{{PM}} verify` (hook enforces) and, for bigger changes, `/forge-review`. Before a release: `/security-audit`.
4. Structure or decision changed → update ARCHITECTURE.md or add an ADR in the same change.
5. New convention or a mistake that must not repeat → `/update-rules`.
