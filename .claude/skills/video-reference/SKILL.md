---
name: video-reference
description: Analyse the client's reference videos, screenshots and screen recordings before scripting — extract shot lists and frames, describe pacing, style, motion, typography, color and audio, and inventory the product UI to recreate. Writes projects/<slug>/references/notes.md. Use when a project has references to study or the user says "match this style".
---

# Reference analysis

Goal: turn "make it like this" into concrete, buildable specs. Output: `projects/<slug>/references/notes.md`.

## 1. Reference videos

For each video in `projects/<slug>/references/`:

```bash
node scripts/frames.mjs projects/<slug>/references/<file>.mp4 --project <slug> --every 2
```

- Soft crossfades are missed at the default threshold; re-run with `--threshold 0.1` if the shot count looks too low. Use `--every 1` for fast-paced edits.
- Read `references/frames/<name>/index.md` (shot list, average shot length = pacing) and **look at the frames** (Read the .jpg files — cut frames first, then samples).
- If the video has VO, get its duration with `npx remotion ffprobe` and estimate words/minute from the transcript if provided.

Describe, per reference:
- **Structure**: hook → problem → demo → benefits → CTA; timestamps
- **Pacing**: avg shot length, cuts on beat or on VO, holds
- **Camera**: zoom-ins on UI, pans, 3D tilts, isometric, static
- **Cursor**: visible? style, speed, click feedback (ripple/scale/sound)
- **Motion vocabulary**: kinetic type, masks, wipes, UI pieces flying in, morphs, parallax, micro-interactions (toggles, toasts, loaders)
- **Typography**: weight, size, case, placement, highlight style
- **Color & background**: dark/light, gradients, grid, brand colors
- **Transitions**: cut / fade / slide / zoom-through / whip
- **Audio**: music genre/energy/BPM, SFX usage, VO tone and pace
- **What to borrow / what to avoid** for this client

## 2. Screenshots & screen recordings of the client's product

These are build inputs, not style references:
- For each screen: what it shows, which elements the script will interact with (buttons, fields, menus), dimensions (`npx remotion ffprobe -v error -show_entries stream=width,height <file>`).
- For recordings: run `frames.mjs` to find the useful segments (in/out timestamps for each step), note resolution and whether the UI needs to be recreated (blurry, wrong data, too fast) or can be used as footage with zooms.
- Decide per screen: **use as footage** (`<Img>`/`<Video>` + `Camera` + `Cursor` overlays) or **recreate as React UI** (`video-ui-recreate`) — recreate when you need animation inside the UI (typing, state changes, data changing), crisp zooms, or brand-clean data.

## 3. Write notes.md

```markdown
# Reference notes — <slug>
## Style summary (5 bullets the whole video must follow)
## Reference 1: <file> — what to borrow
## Pacing target: avg shot X s, total Y s, ~Z words/min
## Motion vocabulary to use (→ library components / new components needed)
## Product screens inventory
| Screen | File | Use as | Interactions | Notes |
## Risks / questions for the client
```

Map every motion idea to a library component when one exists (see the `video-motion` skill). List anything that needs a new component — that's build work to plan for.

Set `stage` to `script` in `project.json` and continue with `video-script`.
