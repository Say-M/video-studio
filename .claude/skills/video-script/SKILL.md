---
name: video-script
description: Write, revise and get approval for a video script — scene-by-scene voice-over, on-screen visuals/motion and on-screen text, sized to the target length and language — then produce voiceover.json for TTS. Use when a project is at the script stage, when the user pastes a script to adapt, or asks to change wording/length/tone of the VO.
---

# Script & scene plan

Output: `projects/<slug>/script.md` (human-readable, client-facing) and `projects/<slug>/voiceover.json` (machine input for `tts.mjs`). The scene ids in both, in `src/projects/<slug>/plan.ts`, and in `vo-timings.json` must match.

## 1. Inputs
Read `brief.md`, `references/notes.md` (if any), client `notes.md`. If the user supplied a script, adapt it rather than rewriting from scratch — keep their wording unless asked.

## 2. Length budget

| Language | Words per minute (natural VO) |
|---|---|
| English | 140–160 (tutorials 130–145) |
| Spanish / Portuguese / Italian | 150–170 |
| German / French | 130–150 |
| Bengali / Hindi | 110–130 |
| Arabic | 110–130 |

`words ≈ targetSeconds / 60 × wpm × 0.9` (leave ~10% for holds, transitions, CTA). State the budget at the top of the script.

## 3. Structure by video type

- **Feature launch** (30–60s): hook (problem or bold claim, ≤ 3s) → reveal feature → 2–3 key moments shown in the UI → proof/benefit → CTA.
- **Screen tutorial** (60–180s): goal of the tutorial → prerequisites (optional) → numbered steps, one action per scene, VO says what to click *as* it happens → result → next step/CTA.
- **Animated tutorial**: same as tutorial but each step is a recreated, simplified UI moment; cut everything not needed for the step.
- **Explainer / promo**: hook → pain → solution → how it works (often isometric/diagram) → benefits → social proof → CTA.

## 4. Writing rules for VO
- Write for the ear: short sentences, active voice, one idea per sentence.
- Use the exact UI labels the viewer will see ("click **Generate report**"), so `wordFrame(scene, 'click')` can cue the click to the spoken word.
- Spell out what TTS mispronounces: "lumen dot io", "S-Q-L", numbers as words when ambiguous. Put the on-screen form in the visual column.
- Each scene = one visual idea, typically 3–10s of VO. Split long scenes; merge tiny ones.
- Scene ids: `s01-hook`, `s02-open-reports`, `s03-generate` … (kebab-case, stable — don't renumber after VO exists; insert as `s02b-…` if needed).

## 5. script.md format

```markdown
# Script — <title>
Status: DRAFT v1
Language: en · Target: 60s · Budget: ~135 words · Current: 128 words (~55s)

| # | Scene id | Voice-over | On-screen visual / motion | Text on screen | Est. |
|---|---|---|---|---|---|
| 1 | s01-hook | … | Mesh gradient; logo pops; kinetic headline | Meet **Smart Reports** | 3s |
| 2 | s02-generate | … click Generate report … | Browser mockup (recreated UI). Camera pushes to button; hand cursor clicks on "click"; skeleton → report; toast | — | 8s |
```

The visual column is the build spec: name the library component or technique (camera push, cursor click, spotlight, isometric explode, toast, typewriter…). Est. = words / (wpm/60).

## 6. Approval loop
1. Present the script in chat as the table (or point to the file) with the word count and estimated duration.
2. Ask: "Approve as is / Change something?" — offer specific options when you made judgement calls (two hook options, tone).
3. Revise → bump `Status: DRAFT v2` …
4. On approval: `Status: APPROVED <date>`; in `project.json` set `approvals.script` and `stage: "voiceover"`.

If the client approves outside the chat, the user will tell you — record who/when.

## 7. voiceover.json

Exactly the VO column, per scene, as it should be spoken:

```json
{"scenes": [
  {"id": "s01-hook", "text": "Meet Smart Reports, from Lumen."},
  {"id": "s02-generate", "text": "Open Reports and click Generate report…"}
]}
```

Then update `src/projects/<slug>/plan.ts` `PLAN` to the same scene ids (fallbackSeconds = the Est. column) and create/rename the scene components so the project still typechecks (`npx tsc`).

Continue with `video-voiceover`.
