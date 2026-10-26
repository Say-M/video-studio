---
name: video-feedback
description: Handle a client revision round — turn timestamped or free-form feedback (text, email, Frame.io/Loom notes, screenshots) into a numbered change list mapped to scenes and files, confirm ambiguous items, apply script/VO/visual/music changes with minimal regeneration, and produce a new draft. Use when the user pastes client feedback or asks for changes to a delivered/reviewed video.
---

# Feedback round

## 1. Log it
Create `projects/<slug>/feedback/round-<N>.md` (N = `project.json` `revision` + 1). Paste the raw feedback verbatim at the top, then the change list.

## 2. Map every note to a change

Find the scene for a timestamp: compute scene start times from `vo-timings.json` + `plan.ts` (durations via `buildTimeline` logic: padBefore + VO + padAfter, minus `TRANSITION` per cut), or ask the user which draft version the timestamps refer to (`renders/…-vN-draft.mp4`).

```markdown
| # | Time | Scene | Feedback | Change | Type | Files |
|---|---|---|---|---|---|---|
| 1 | 0:12 | s02-generate | "zoom is too fast" | camera move 20f → 35f | visual | scenes/GenerateScene.tsx |
| 2 | 0:20 | s03-how | "say 'teams' not 'team'" | VO line edit | script+VO | voiceover.json, script.md |
| 3 | — | all | "logo bigger" | logo 120→160 × unit | visual | scenes/HookScene.tsx |
```

Types: `script+VO` (costs TTS), `visual`, `timing`, `music`, `brand`, `format`.

## 3. Clarify before working
Ambiguous notes ("make it pop", "more premium") → propose 2–3 concrete interpretations with AskUserQuestion. Contradictions with the approved script/brief → flag them; the user decides whether it's in scope.

## 4. Apply in this order (cheapest re-work first)
1. Script/VO text changes → update `script.md` + `voiceover.json` → `node scripts/tts.mjs <slug>` (only changed lines regenerate; scene timing updates automatically).
2. Timing/visual changes in scenes.
3. Brand changes (`clients/<client>/brand.json` → affects every project of that client — confirm scope).
4. Music changes (`video-music`).

Verify each changed moment with stills (see `video-build`), `npx tsc`.

## 5. Deliver the revision
- Draft render: `node scripts/render.mjs <slug> --draft` (formats the client is reviewing).
- Mark each row in `round-<N>.md` as ✅ done / ❓ needs client input / ⏭ out of scope.
- `project.json`: `revision` = N, `stage` = `review`.
- Write a short client-ready changelog the user can paste in an email (numbered, matches their notes).
- Append recurring preferences to `clients/<client>/notes.md` ("prefers slower camera moves").
