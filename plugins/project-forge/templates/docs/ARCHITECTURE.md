# Architecture — {{PROJECT_NAME}}

## Overview
{{SYSTEM_OVERVIEW}}

## Layers and dependency rule
```
ui        screens, routes, components, primitives      → may import logic
logic     features, hooks, use-cases, domain models    → may import network, data
network   API clients, external services               → may import data (types only)
data      db, storage, repositories, schemas
```
Imports only go downward. Enforced by `.forge/config.json` (checked on every edit) and lint.

## Folder map
{{FOLDER_MAP}}

## Data flow (core user action)
{{CORE_FLOW}}

## Cross-cutting
- **Config/env:** {{ENV_MODULE_PATH}} — validated at startup, typed access only.
- **Errors:** {{ERROR_STRATEGY}}
- **Logging:** {{LOGGING_STRATEGY}}
- **Validation:** zod schemas at network/data boundaries.

## Testing strategy
- Unit: logic layer (pure functions, hooks, use-cases).
- Integration: network/data with mocked transports.
- E2E: critical path only — {{E2E_SCOPE}}.

## Decisions
See `docs/adr/`. Latest: [0001 — Architecture and stack](docs/adr/0001-architecture-and-stack.md).

## Target state / known gaps
{{GAPS_OR_NONE}}
