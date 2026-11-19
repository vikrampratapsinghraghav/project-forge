# project-forge

A Claude Code plugin that starts **production-grade projects** and keeps them clean.

- `/new-project`: interviews you one question at a time, designs a layered architecture, scaffolds Next.js / Expo (or a better-fit stack), and writes `CLAUDE.md`, `ARCHITECTURE.md`, an ADR, CI and tests
- `/design-system`: picks a visual direction, creates design tokens and `DESIGN.md`, and builds accessible UI primitives
- `/update-rules`: records new decisions in the right document and keeps `CLAUDE.md` short
- `/forge-review`: runs verify plus the architecture and design guardian agents before a commit or PR
- **Hooks** (automatic, every session):
  - after each edit: layer-boundary and design-token checks
  - before each `git commit`: runs `verify` (lint + typecheck + tests) and blocks the commit if it fails

Works the same on **macOS, Linux and cloud sessions**. Hooks are plain Node scripts with no dependencies.

## Install

### Mac / local Claude Code
```text
/plugin marketplace add vikrampratapsinghraghav/project-forge
/plugin install project-forge@project-forge
```
This also installs the companion plugins from the official marketplace automatically: `superpowers`, `feature-dev`, `frontend-design`, `pr-review-toolkit`, `code-simplifier`, `claude-md-management` and `security-guidance`. If one is missing, run `/reload-plugins`.

Plugin dependencies need a recent Claude Code version. Run `claude update` if the dependencies don't install.

### Cloud sessions / every project automatically
`/new-project` writes `.claude/settings.json` into each project:
```json
{
  "extraKnownMarketplaces": {
    "project-forge": { "source": { "source": "github", "repo": "vikrampratapsinghraghav/project-forge" } }
  },
  "enabledPlugins": { "project-forge@project-forge": true }
}
```
Any session that opens the repo (once the folder is trusted) loads the plugin, and its dependencies come with it.

## How the rules are enforced

| Layer | What it does | Strength |
|---|---|---|
| `CLAUDE.md` | Loaded every session: stack, commands, rules | Guidance |
| SessionStart hook | Reminds Claude which docs and rules apply | Guidance |
| Post-edit hook | Flags imports that cross layers (e.g. UI → network) and raw hex/rgb/px in UI files | Automatic feedback |
| Pre-commit hook | Runs `verifyCommand`; failure blocks the commit | **Hard gate** |
| Guardian agents | Review reuse, tests, security, accessibility | Review |
| CI | Same `verify` on every push/PR | **Hard gate** |

Configure per project in `.forge/config.json` (presets in `plugins/project-forge/templates/presets/`). Add `forge-ignore` on a line to deliberately skip a check.

Hooks only act inside folders that contain `.forge/config.json`, so other projects are not affected.

## Requirements
- Node.js 18+ on the machine running Claude Code
- Git

## Develop
```bash
npm run verify   # validates manifests + runs tests (node:test, zero dependencies)
```

## Limits (honest)
- Layer checks are static import analysis. They catch most boundary breaks, not all of them (e.g. runtime injection).
- Design checks flag raw values in UI folders. Judging taste and consistency still relies on the design guardian and you.
- Companion plugins come from Anthropic's official marketplace. If one is renamed or removed there, update `plugin.json`.

## License
MIT
