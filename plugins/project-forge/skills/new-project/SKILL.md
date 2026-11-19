---
name: new-project
description: Start a new production-grade project (or adopt an existing repo) with clean layered architecture, a token-based design system, CLAUDE.md / ARCHITECTURE.md / DESIGN.md, tests, CI and enforcement hooks. Use when the user says "new project", "/new-project", "start a project", "bootstrap", "scaffold", or asks to set up an existing repo with project-forge rules.
---

# /new-project — production-grade project bootstrap

You are setting up a project that must stay clean for its whole life. Quality beats speed.
Never write application code until the user approves the plan in Phase 3.

## Ground rules for this whole flow
- Ask questions **one at a time**. Short questions, offer 2–4 options with a recommended default.
- The user prefers short, skimmable messages: first line = the point, max 5 bullets.
- Templates live in `${CLAUDE_PLUGIN_ROOT}/templates/`. Read them; fill every `{{PLACEHOLDER}}`; never leave a placeholder in the output.
- Works the same on macOS and in cloud sessions: no OS-specific commands, no absolute home paths.

## Phase 0 — Mode and prerequisites
1. If the current folder already has code, ask: **adopt** this repo (add docs, config, hooks, CI without rewriting code) or **new** project in a subfolder.
2. Check which helper plugins/skills are available in this session and tell the user in one short list what is missing (do not stop if some are missing — degrade gracefully):
   - `superpowers` (brainstorming, writing-plans, TDD) — used in Phases 2–3
   - `feature-dev` (code-architect agent) — used in Phase 2
   - `frontend-design` — used by the design-system skill
   - `pr-review-toolkit`, `code-simplifier`, `claude-md-management` — used later
   The generated `.claude/settings.json` enables all of them for this project, so future sessions (Mac or cloud) get them automatically.

## Phase 1 — Discovery (one question at a time)
Collect, in this order, stopping as soon as answers are clear:
1. What are we building, for whom, and the single most important user action?
2. Platform: web, mobile (iOS/Android), or both?
3. Stack: offer the default — **Next.js (App Router, TypeScript)** for web, **Expo (React Native, TypeScript, expo-router)** for mobile — OR "find the best fit". If best fit: propose max 2 alternatives with one-line trade-offs, then let the user choose.
4. Backend/data needs: none / Supabase / own API / other.
5. Auth needed? Payments? Offline? (only ask what matters for this project)
6. Package manager: default **pnpm**.
Summarise the answers in ≤5 bullets and confirm.

## Phase 2 — Architecture design
Use `superpowers:brainstorming` if available, and the `feature-dev` **code-architect** agent if available, to design:
- **Layers** (dependency direction only goes downward):
  `ui` (screens, components) → `logic` (features, hooks, use-cases, domain) → `network` (API clients, services) / `data` (db, storage, repositories)
- Folder structure mapped to those layers (start from `templates/presets/forge-config.web.json` or `forge-config.mobile.json`).
- Cross-cutting: typed env config (validated with zod at startup), error handling, logging, input validation at boundaries.
- Testing strategy: unit (logic), integration (network/data with mocks), a few e2e for the critical path.
- Security: secrets only in env, validate all external input, least-privilege keys, dependency audit in CI.
Write the decision record as `docs/adr/0001-architecture-and-stack.md` from `templates/docs/adr-template.md`.

## Phase 3 — Plan and approval
Use `superpowers:writing-plans` if available. Present a short milestone plan:
M0 scaffold + tooling + CI green → M1 design system → M2 first vertical slice of the core user action → …
Each milestone small and shippable. **Wait for explicit approval.**

## Phase 4 — Scaffold (after approval)
1. Create the app with the official generator (`create-next-app` / `create-expo-app`) using TypeScript; then restructure folders to match the layers.
2. Tooling: TypeScript `strict` (+ `noUncheckedIndexedAccess`), ESLint (with import boundaries where the stack supports it), Prettier, Vitest (web) or Jest (Expo) + Testing Library.
3. Add a single `verify` script that runs **lint + typecheck + tests**, e.g. `"verify": "pnpm lint && pnpm typecheck && pnpm test --run"`.
4. Add `.env.example`, typed env module, and `.gitignore` covering env files.
5. Copy and fill:
   - `templates/CLAUDE.md` → `CLAUDE.md`
   - `templates/docs/ARCHITECTURE.md` → `ARCHITECTURE.md`
   - `templates/github/ci.yml` → `.github/workflows/ci.yml`
   - `templates/github/pull_request_template.md` → `.github/pull_request_template.md`
   - the matching preset → `.forge/config.json` (set `verifyCommand`, layer folders, tokens file paths)
   - `templates/claude-settings.json` → `.claude/settings.json` (merge if one exists)
6. Write one real test per layer so the structure is proven, not empty.

## Phase 5 — Design system
Run the **design-system** skill (`/design-system`). It produces tokens, `DESIGN.md` and the UI primitives.

## Phase 6 — Verify and hand over
1. Run `verify`. Fix until green. Never weaken a test or a lint rule to get green.
2. Initialise git if needed and make the first commit (the pre-commit hook will run verify again).
3. Tell the user, in ≤5 bullets: what was created, the commands (`dev`, `verify`), and the one next step (usually M2).

## Adopt mode (existing repo)
Skip scaffolding. Read the code first, infer layers from the real folders, write `.forge/config.json` to match reality, write the docs describing the **current** architecture plus a short "target" section, and list (do not perform) refactors needed to reach the target. Ask before changing any code.
