# Design system — {{PROJECT_NAME}}

## Direction
- **Subject and audience:** {{SUBJECT_AND_AUDIENCE}}
- **Mood:** {{MOOD_WORDS}}
- **Type:** {{TYPE_PAIRING}}
- **Colour story:** {{COLOUR_STORY}}
- **References:** {{REFERENCES}}

## The one bold element
{{BOLD_ELEMENT}}. Everything else stays quiet.

## Defaults we deliberately avoided
{{AVOIDED_DEFAULTS_WITH_REASONS}}

Allowed exceptions in `.forge/config.json → design.allow`: {{ALLOWED_EXCEPTIONS_OR_NONE}}

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
- Don't: inline hex/rgb/px values, custom one-off buttons, colour as the only signal, decoration that carries no information.

## Copy
- Buttons name the action ("Create project", "Save changes"). The same verb is used through the whole flow.
- Errors say what happened and how to fix it. No apologies, no jokes.
- Empty states invite the next action.

## Accessibility
- Text contrast ≥ 4.5:1 (large text/icons ≥ 3:1) in light and dark.
- Every input and icon button has an accessible label; visible focus ring.
- Touch targets ≥ 44×44; respect reduced-motion.
