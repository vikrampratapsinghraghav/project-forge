# {{PROJECT_NAME}}

{{ONE_LINE_PURPOSE}}

> Keep this file under ~150 lines. Details live in ARCHITECTURE.md, DESIGN.md and docs/adr/. Update it with `/update-rules`.

## Stack
{{STACK_BULLETS}}

## Commands
- `{{PM}} dev` — run locally
- `{{PM}} verify` — lint + typecheck + tests (must pass before every commit; enforced by hook)
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

## Security rules
- No secrets in code or commits. `.env*` is git-ignored; document vars in `.env.example`.
- Validate all user and external input. Escape output; no unsafe HTML.
- Least-privilege keys; server-only secrets never reach the client bundle.

## Design rules (see DESIGN.md)
- Colours, sizes, fonts, shadows come from tokens only ({{TOKENS_PATH}}). Raw values are flagged by hook.
- Build screens from primitives in `{{UI_PRIMITIVES_PATH}}`; add a variant before adding a new component.
- Accessible by default: labels, focus states, contrast, 44×44 touch targets.

## Workflow
1. Non-trivial change → short plan first, then implement in small steps.
2. Keep changes focused; one concern per commit.
3. Before committing: `{{PM}} verify` (hook enforces) and, for bigger changes, `/forge-review`.
4. Structure or decision changed → update ARCHITECTURE.md or add an ADR in the same change.
5. New convention or a mistake that must not repeat → `/update-rules`.
