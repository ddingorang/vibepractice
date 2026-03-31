# Created: 2026-03-31 23:40:00
---
name: study05 project overview
description: Single-file HTML emotion diary app using OpenRouter AI (LLaMA/Gemma free models) — key bugs found and fixed on 2026-03-31
type: project
---

Single-file emotion diary app at `/Users/sanghyun/Desktop/vibecoding/study05/index.html`.

**Stack:** Vanilla HTML/CSS/JS, OpenRouter API (primary: meta-llama/llama-3.2-3b-instruct:free, fallback: google/gemma-3-1b-it:free), Google Fonts Noto Serif KR.

**Bugs fixed on 2026-03-31:**
1. `analyzeDiary` fallback break condition incorrectly included HTTP 429 — removed so rate-limit errors try the fallback model.
2. `renderResult` called `scrollIntoView` synchronously before browser paint — wrapped in `requestAnimationFrame`.
3. `handleSubmit` hid existing result card even on validation-only errors (empty/too-short input) — moved pre-check before the loading state and result-clear logic.
4. Char counter and near-limit threshold were hardcoded (`200`, `170`) instead of referencing `CONFIG.MAX_INPUT_LENGTH` — replaced with CONFIG references.
5. `#error-message` had no CSS `display:none` baseline, relying solely on inline style — added to CSS rule.

**Why:** Fixes ensure fallback model is actually used, smooth scroll works on first render, UX is preserved on validation errors, and future CONFIG changes propagate to the UI.

**How to apply:** When reviewing this file again, start from these known bug patterns rather than re-scanning from scratch.
