---
name: update-rules
description: Record a new decision, convention or lesson into the project's living rules (CLAUDE.md, ARCHITECTURE.md, DESIGN.md, ADRs, .forge/config.json) while keeping CLAUDE.md short. Use when the user says "/update-rules", "remember this rule", "add this to CLAUDE.md", after an architecture decision, or after fixing a mistake that should never repeat.
---

# /update-rules — keep the rules alive and short

## 1. Capture
Ask (one question, skip if already clear): what is the rule, and why? Restate it as one imperative sentence.

## 2. Route it to the right place
| Kind of rule | Where it goes |
|---|---|
| Must be followed on every change (short, imperative) | `CLAUDE.md` |
| Folder/layer/data-flow/structure | `ARCHITECTURE.md` (+ `.forge/config.json` layers/forbidden if enforceable) |
| Visual / token / component rule | `DESIGN.md` (+ `design.checkDirs` if enforceable) |
| Significant decision with trade-offs | new `docs/adr/NNNN-title.md` from the ADR template, linked from ARCHITECTURE.md |
| Can be checked by a tool | add/adjust a lint rule, test, or `.forge/config.json` — enforcement beats prose |

## 3. Keep CLAUDE.md lean
- Target ≤150 lines. If it grows, move detail to the docs and leave a one-line pointer.
- No duplicates: update an existing rule instead of adding a near-copy.
- Delete rules that are now enforced by tooling (keep a one-line mention).
- If the `claude-md-management` plugin is available, use it to audit CLAUDE.md quality afterwards.

## 4. Confirm
Show the exact diff (≤10 lines) and ask before saving. After saving, if `.forge/config.json` changed, run `verify` to be sure nothing breaks.
