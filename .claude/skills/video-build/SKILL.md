---
name: video-build
description: Build or edit a project's Remotion video from the approved script and voice-over — plan.ts scene list, one component per scene, VO-cued animation, transitions, music, multi-format layout — with Studio preview and frame-by-frame visual verification. Use when a project is at the build stage or the user asks to change visuals/timing of a scene.
---

# Build the video

Load `remotion-best-practices` (and through it `remotion-markup` / `remotion-interactivity`) before writing Remotion code. Use `video-motion` for components and choreography, `video-ui-recreate` for product UI, `video-music` for audio.

## Project code layout (`src/projects/<slug>/`)

| File | Role |
|---|---|
| `plan.ts` | `PLAN` (scene ids + fallbackSeconds), `FPS`, `TRANSITION`, `TIMINGS` (vo-timings.json), `MUSIC` |
| `Video.tsx` | `BrandProvider` → `TransitionSeries` with one `TransitionSeries.Sequence` per scene → `MusicBed` |
| `Compositions.tsx` | one `<Composition>` per format, duration from `calculateMetadata` (follows VO) |
| `scenes/<Name>Scene.tsx` | one component per scene: `({scene}: {scene: TimedScene})` |
| `ui/` | recreated product UI |
| `vo-timings.json` | written by `tts.mjs` — don't hand-edit unless VO is manual |

## Steps

1. **Open the preview first.** Start Studio in the background (`npx remotion studio --no-open`, run_in_background) and open the printed URL + `/<slug>-16x9` in the in-app browser so the user can watch progress. Keep it running.
2. **Sync the plan.** `PLAN` ids = `voiceover.json` ids = scenes in `Video.tsx`, in script order. Set `fallbackSeconds` from the script's Est. column. Per scene you may set `padBefore`/`padAfter` (defaults 0.3s / 0.6s; keep `padAfter` ≥ transition length) or `minSeconds` for scenes that need time after the VO. `VO_SPEED` in `plan.ts` plays the whole voice-over faster/slower (1 = as generated) and re-times every scene; the user may tune it by hand.
3. **Build scene by scene**, in script order. For each scene:
   - Read its row in `script.md` (VO + visual spec) and the reference notes.
   - Get cue frames from the VO: `wordFrame(scene, '<word>', fps, {fallbackSeconds})`.
   - Compose with library components; keep `useFormat()` sizing (`unit`, `safe`, `isVertical`) so all formats work.
   - Follow Remotion interactivity rules for scene-level elements: inline `interpolate()` in `style`, `Interactive.Div`/`Img` with literal `name`s, `scale`/`translate`/`rotate` props.
   - Include `<SceneVoice scene={scene} />` and, for vertical formats if the brief wants captions, `<Captions words={scene.vo.words} offsetFrames={scene.voOffset} />`.
4. **Typecheck**: `npx tsc` after each scene.
5. **Look at it.** Render stills at the key moments of the scene (before/at/after each cue):
   ```bash
   npx remotion still <slug>-16x9 out/check/s02-a.png --frame=<absolute frame>
   ```
   Absolute frame = sum of previous scene durations − transitions × index + local frame. Read the PNGs. Check: focal point clear, nothing clipped by safe area, text readable, cursor exactly on target, no overlaps. Fix and re-check. Repeat for `9x16` / `1x1` if those formats are deliverables.
   (Use `remotion still` per frame — `render --frames=a,b,c` crashes on audio in this Remotion version.)
6. **Transitions** between scenes: `fade()` default, `slide({direction})` for "next step" energy, `wipe()` for before/after. 10–15 frames. Use the same few throughout a video.
7. **Music**: generate/add via `video-music` once the cut is stable (its length depends on the VO).
8. **Full watch-through**: ask the user to scrub the whole video in Studio, or render a draft: `node scripts/render.mjs <slug> --draft --formats 16x9`.

Then: `stage: "review"` → `video-render` (draft for client).

## Editing an existing scene
Read the scene file fully first; the user may have tweaked values in Studio (written back into the code) — keep their edits. Change only what was asked, re-run `npx tsc`, re-check stills of the affected moments.

## Common issues
- Scene too short for its animation → raise `minSeconds` in `PLAN` or tighten the animation; never cut the VO.
- Animation cue wrong after VO regeneration → you hardcoded a frame; switch it to `wordFrame()`.
- Fonts look wrong → brand font not loaded in `Video.tsx` (see `brand-kit`).
- Remote image/video fails in render → copy it into `public/projects/<slug>/` and use `staticFile()`.
- Heavy scenes slow in Studio → lower preview resolution in Studio; final render is unaffected.
