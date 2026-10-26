---
name: video-render
description: QA and export — draft previews and review stills for the client, then final full-quality renders in every delivery format (16:9, 9:16, 1:1, 4K) with a pre-flight checklist, versioned output in projects/<slug>/renders/, and a delivery summary. Use when the user says render, export, draft, preview for client, deliver, or "give me the MP4".
---

# Render & deliver

Only render when asked (or at the review stage). Studio's preview is the default way to look at work.

## Draft for review
```bash
node scripts/render.mjs <slug> --draft                    # half resolution, fast, all project formats
node scripts/render.mjs <slug> --draft --formats 16x9
node scripts/render.mjs <slug> --stills 0,120,300         # PNG stills per format → renders/stills/<fmt>/
```
Drafts are named `<slug>-<fmt>-v<next>-draft.mp4` (overwritten until the final of that version exists).

## Pre-flight checklist (before a final)
- [ ] `approvals.preview` set in `project.json` (client approved the draft) — otherwise ask.
- [ ] `npx tsc` passes.
- [ ] VO: every scene in `voiceover.json` has audio (`node scripts/tts.mjs <slug> --dry-run` shows nothing to generate).
- [ ] Music set in `plan.ts` (or explicitly "no music" in the brief); levels: VO clear over music.
- [ ] Each delivery format checked with stills at hook, every key action, and the CTA — text inside safe area, nothing cropped in 9:16 / 1:1.
- [ ] Captions present where the brief requires them; spelling of on-screen text and CTA URL.
- [ ] Brand: logo, colors, fonts correct; no placeholder text ("Recreated UI goes here", "Call to action here").
- [ ] Ending: last frame holds ≥ 1s on CTA, music fades out.

## Final render
```bash
node scripts/render.mjs <slug>                         # all formats in project.json
node scripts/render.mjs <slug> --formats 16x9,9x16,4k
```
- H.264, CRF 18, PNG frames for clean UI edges. `4k` = the 16x9 composition at `--scale=2` (UI stays sharp because it's vector/HTML; raster screenshots should be ≥ 2× for 4K).
- Output: `projects/<slug>/renders/<slug>-<fmt>-v<N>.mp4`. The script sets `stage: "delivered"`.
- Long renders: run in the background and tell the user it's running.
- Special needs: transparent overlays (ProRes 4444) → `remotion-render/transparent-videos.md`; GIF → `npx remotion render <comp> out.gif --codec=gif --every-nth-frame=2`; thumbnail → `npx remotion still <comp> thumb.png --frame=<N>`.

## Delivery summary
Give the user: file list with format, resolution, duration and size (`npx remotion ffprobe -v error -show_entries format=duration,size -of default=nw=1 <file>`), what changed since the last version, and anything not done. Set `approvals.final` when the client signs off.
