# GH#207 - Quiz Deselect Guard Closure

**Date:** 2026-06-19
**Issue:** admin's 2026-05-16 report that trying to deselect an answer "tried to send an email."
**Source:** `docs/admin/2026-05-16-outbound-implementation-confirmation.md:38,71`

## Closure decision

No follow-up repro was captured after the studio asked which page/quiz she meant. The best repository-local hypothesis was accepted: in `/quiz`, selected answers auto-advanced, but there was no true deselect action. On the result panel, the capture form then became the next prominent interaction, which could read as the quiz pushing the user toward email.

This closure fixes the code-level bug defensively instead of keeping the issue client-gated.

## Behavior now locked

- Quiz answer buttons are `type="button"` controls, not implicit submit buttons.
- Answer buttons expose `aria-pressed` and update it with selection state.
- Tapping the currently selected answer again deletes that step's answer, removes the selected style, and stays on the same question.
- Deselecting also cancels any pending 280ms auto-advance timer, so a stale timer cannot carry the user into the next step or result panel.
- The result panel now refuses to render unless all quiz steps have answers.
- `/capture` remains submit-only: the optional email path is still reached only through the result-panel form submit.

## Verification

Static contract coverage was added in `scripts/test.mjs` for the inert buttons, selected-answer deselect branch, stale timer guard, and result completeness guard.

Verified in this worktree:

- `npm run prebuild` - passed; regenerated citations and library manifest.
- `npm run test` - passed after the code change and again after prebuild.
- `npm run check` - blocked because `node_modules` is absent in this worktree (`astro: command not found`).
- `npm run build` - blocked for the same reason after its `prebuild` step (`astro: command not found`).
