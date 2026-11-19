---
name: design-system
description: Create or extend a project's design system — visual direction, design tokens (colour, type, spacing, radius, shadow, motion), DESIGN.md and reusable UI primitives — for web (Next.js/Tailwind/CSS) or mobile (Expo/React Native). Use during /new-project, or when the user says "design system", "tokens", "theme", "restyle", or asks for consistent UI.
---

# /design-system — tokens first, components second

Goal: every colour, size and font in the UI comes from **one tokens source**, and screens are built from shared primitives. This is what keeps the app looking designed instead of generated.

## Step 1 — Direction (one question at a time)
1. Brand/mood in 3 words (e.g. "calm, trustworthy, modern").
2. Any references: Figma link, websites, screenshots, existing brand colours or logo?
3. Light, dark, or both? (default: both)
4. Primary audience/device context (affects density and type scale).

If a **design-scout** skill is available, run it with the mood + product idea and show the 3–5 best references.
If a Figma link is given and a Figma MCP is connected, pull variables/styles from it and use them as the source of truth.
Use the **frontend-design** skill (if available) to choose a distinctive direction: type pairing, colour story, spacing rhythm, motion feel. Present it in ≤5 bullets and get approval.

## Step 2 — Tokens (single source of truth)
Create the tokens file at the path set in `.forge/config.json → design.tokensFiles` (start from `${CLAUDE_PLUGIN_ROOT}/templates/tokens.ts`):
- **Primitive tokens**: raw palette scales, font families, sizes, spacing scale (4-pt base), radii, shadows, durations.
- **Semantic tokens**: `color.bg`, `color.surface`, `color.text`, `color.textMuted`, `color.primary`, `color.onPrimary`, `color.border`, `color.danger`, `color.success`, `color.focus` … for light and dark.
- Components use **semantic tokens only**, never primitives directly.
- Web: expose tokens as CSS variables (`:root` / `[data-theme="dark"]`) and wire them into Tailwind theme if Tailwind is used. Mobile: export a typed `theme` object + a `useTheme()` hook.
- Check contrast: text on background ≥ 4.5:1, large text/icons ≥ 3:1. Adjust tokens until it passes.

## Step 3 — Primitives
Build in the `ui` layer (e.g. `src/ui/`): `Text`, `Heading`, `Button` (variants: primary/secondary/ghost/danger; sizes; loading; disabled), `Input`, `Card`, `Stack`/`Box` (spacing via tokens), `Icon`, `Spinner`, `EmptyState`, `ErrorState`.
Each primitive: typed props, accessible by default (labels, roles, focus ring, 44×44 touch target on mobile), one test for behaviour, and a usage example in DESIGN.md.

## Step 4 — DESIGN.md
Fill `${CLAUDE_PLUGIN_ROOT}/templates/docs/DESIGN.md` → `DESIGN.md`: direction, token tables, primitives with examples, do/don't rules, accessibility rules.

## Step 5 — Enforcement
- Make sure `.forge/config.json → design.checkDirs` covers the UI folders and `design.tokensFiles` lists the tokens file(s). The post-edit hook then flags raw hex/rgb/px in UI files.
- Run the `accessibility-review` skill on the first real screen if it is available.
- Report what was created in ≤5 bullets.

## Extending later
New colour or size? Add a token (semantic first), document it in DESIGN.md, then use it. Never inline the raw value. New component? Search `src/ui` first; extend an existing primitive with a variant before creating a new one.
