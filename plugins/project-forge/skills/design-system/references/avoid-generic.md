# Avoid the generated look

Generated UIs cluster around the same defaults. Each is fine when the brief asks for it, but it must be a **choice**, never the fallback. When an axis is free, don't spend that freedom on one of these.

## Visual defaults to avoid
- Purple→pink / blue→purple gradients, gradient text, gradient "glow" blobs behind content.
- Glassmorphism (`backdrop-blur` panels) used as decoration.
- The SaaS card kit: everything chopped into identical rounded cards, one radius on everything, the same soft grey shadow under each.
- Default framework palettes used as the brand (Tailwind indigo-500/600, violet, slate) without a reason.
- Warm cream background + serif display + terracotta accent; near-black background + one acid-green or vermilion accent; broadsheet hairlines with zero radius. (All common generated looks.)
- Emoji used as icons in product UI.
- Hero = big number + small label + gradient accent, or centered headline + subtitle + two buttons, by default.

## Typography defaults to avoid
- Inter/Roboto/system everywhere with no decision behind it.
- Highlighting one word of a headline in another colour, italic or gradient.
- ALL-CAPS tracked "eyebrow" labels above every heading.
- Meta strings joined with middle dots (`A · B · C`), `WORD — fragment` labels, `→` appended to every link/button.
- Monospace for small labels just to look technical.

## Layout and motion defaults to avoid
- Numbered markers (01 / 02 / 03) on content that isn't a sequence.
- Fade-and-slide-up on every section, hover lift on every card.
- Decorative dividers, borders and labels that carry no information.

## Copy defaults to avoid
- Selling instead of saying ("Supercharge your workflow"). Say what it does, plainly.
- Vague CTAs ("Get started", "Submit") when a specific verb exists ("Create project", "Save changes").
- Apologetic or cute errors. State what happened and how to fix it.

## What to do instead
1. **Ground it in the subject.** The product's industry, materials and vocabulary are where distinct choices come from. A finance dashboard and a kids' app must not look alike.
2. **Plan, then review the plan.** Write a compact plan (4–6 named colours, 1–2 typefaces with roles, layout concept with an ASCII wireframe, 3 principles). Then ask: "Would I produce this same plan for any similar product?" Revise every part that is a default, and say what changed and why.
3. **Spend boldness in one place.** One memorable element (the type treatment, an illustration, a layout move, a single interaction). Everything else quiet and disciplined.
4. **Typography carries personality.** Choose typefaces for this brief; set a clear scale; line length under ~80 characters.
5. **Structure is information.** Borders, numbering and labels only when they encode something.
6. **Motion answers actions.** One orchestrated moment at most; otherwise motion only to show what changed after a user action. Respect reduced motion.
7. **Remove one accessory.** Before shipping a screen, cut one decorative thing.
