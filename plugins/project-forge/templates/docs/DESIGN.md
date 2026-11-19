# Design system — {{PROJECT_NAME}}

## Direction
- **Mood:** {{MOOD_WORDS}}
- **Type:** {{TYPE_PAIRING}}
- **Colour story:** {{COLOUR_STORY}}
- **References:** {{REFERENCES}}

## Tokens
Source of truth: `{{TOKENS_PATH}}`. Components use **semantic** tokens only.

| Semantic token | Light | Dark | Use |
|---|---|---|---|
{{SEMANTIC_TOKEN_ROWS}}

Spacing scale (4-pt): {{SPACING_SCALE}} · Radii: {{RADII}} · Type scale: {{TYPE_SCALE}}

## Primitives (`{{UI_PRIMITIVES_PATH}}`)
{{PRIMITIVES_WITH_EXAMPLES}}

## Rules
- Do: use tokens and primitives; add a variant before a new component; design loading/empty/error states.
- Don't: inline hex/rgb/px values, custom one-off buttons, colour as the only signal.

## Accessibility
- Text contrast ≥ 4.5:1 (large text/icons ≥ 3:1) in light and dark.
- Every input and icon button has an accessible label; visible focus ring.
- Touch targets ≥ 44×44; respect reduced-motion.
