# Video Studio — AI video production with Claude Code + Remotion

A workspace for producing client videos (SaaS explainers, screen-recorded tutorials, animated tutorials, feature launches) with Claude Code doing the production work: brief → references → script → voice-over → build → review → revisions → delivery.

Open a new Claude Code session in this folder and say **"hi"** or **"new video"**. Claude reads the studio status, asks what you're working on, and walks the pipeline with you.

---

## 1. One-time setup

1. **API keys**: copy `.env.example` to `.env` and fill in:
   - `ELEVENLABS_API_KEY` (and optionally `ELEVENLABS_DEFAULT_VOICE_ID`)
   - `CARTESIA_API_KEY` (and optionally `CARTESIA_DEFAULT_VOICE_ID`)
   - `STABILITY_API_KEY` (Stable Audio music/SFX)
2. Dependencies are already installed. After cloning to another machine, run `npm install`.
3. Optional: install a full ffmpeg (`winget install Gyan.FFmpeg`). The scripts use it when it's on PATH and fall back to Remotion's bundled one otherwise.
4. Look at the demo: `npx remotion studio` → open `demo-saas-launch-16x9`. It shows every library piece working together.

## 2. Daily workflow

| Step | You do | Claude does | Skill |
|---|---|---|---|
| **1. Start** | Open a session, say "new video" (or name a project to continue) | Shows status, asks new vs. continue | `video` |
| **2. Brief** | Answer 2–3 rounds of multiple-choice questions. Paste the client brief, drop in file paths for references, screenshots, recordings and logo | Creates the project, files inputs, writes `brief.md`, sets up the brand kit for new clients | `video-intake`, `brand-kit` |
| **3. References** | — | Extracts shot lists and frames from reference videos, describes pacing, motion style, typography and audio, and lists the product screens | `video-reference` |
| **4. Script** | Review the table, request changes, approve (or send it to the client) | Writes VO plus a visual plan per scene sized to the target length and language, then `voiceover.json` | `video-script` |
| **5. Voice** | Pick a voice from 2–3 samples (first time per client) | Generates VO per scene with word timestamps. Only changed lines are regenerated | `video-voiceover` |
| **6. Build** | Watch Studio while Claude works and steer ("slower zoom", "bigger text") | Recreates the product UI from screenshots, animates scenes cued to the spoken words, adds transitions, music and SFX, and checks every format visually | `video-build`, `video-ui-recreate`, `video-motion`, `video-music` |
| **7. Review** | Send the draft to the client | Renders drafts and stills | `video-render` |
| **8. Revisions** | Paste the client feedback, timestamps included | Maps each note to a scene, asks about ambiguous notes, applies changes, renders a new draft and writes a changelog | `video-feedback` |
| **9. Deliver** | Approve | Runs the pre-flight checklist and final renders in 16:9 / 9:16 / 1:1 / 4K, versioned | `video-render` |

There are two approval gates: **script approval** before any voice credits are spent, and **preview approval** before the final render. Claude asks before running the paid scripts (`tts.mjs`, `music.mjs`).

### Useful things to say
- "new video for acme, 60s feature launch, here's the brief: …"
- "continue acme-reports-launch"
- "analyse the reference in projects/acme-reports-launch/references/ref-01.mp4"
- "make the hook punchier, 2 options"
- "try a different voice, warmer, female, US"
- "client feedback: 0:12 zoom too fast, 0:20 say 'teams', logo bigger"
- "render drafts for the client" / "final render all formats"
- "status" (lists every project and its next step)

## 3. Folder map

```
clients/<client>/          brand.json (colors, fonts), notes.md (voice, tone, past feedback)
public/clients/<client>/   logo, brand fonts
projects/<slug>/           brief.md, script.md, voiceover.json, project.json, assets-log.md
  references/              client inputs + analysis (notes.md, frames/)
  feedback/                round-1.md, round-2.md…
  renders/                 deliverables v1, v2… and drafts
src/projects/<slug>/       the Remotion code for that video (scenes/, ui/, plan.ts…)
public/projects/<slug>/    media in the video: vo/, music/, sfx/, screens/, recordings/
src/library/               shared motion library (cursor, camera, mockups, isometric, text, UI…)
scripts/                   status, new-project, frames, voices, tts, music, render
.claude/skills/            the workflow skills
templates/                 what a new project starts from
```

**Where to drop files:** inputs only for Claude to study go in `projects/<slug>/references/`. Anything that will appear in the video (screenshots, recordings, images) goes in `public/projects/<slug>/screens|recordings/`. If you're unsure, give Claude the path and it will file it.

## 4. Commands (Claude runs these, but you can too)

```bash
node scripts/status.mjs
node scripts/new-project.mjs acme-reports-launch --client acme --title "Smart Reports" --type feature-launch --formats 16x9,9x16 --duration 60
node scripts/frames.mjs path/to/reference.mp4 --project acme-reports-launch
node scripts/voices.mjs --provider elevenlabs --search british
node scripts/tts.mjs acme-reports-launch
node scripts/music.mjs acme-reports-launch --prompt "TrackType: Music, minimal electronic…"
node scripts/render.mjs acme-reports-launch --draft
node scripts/render.mjs acme-reports-launch
npx remotion studio
```

## 5. The motion library (`src/library`)

| Style you sell | Built with |
|---|---|
| Cursor interaction with feedback | `Cursor` (arc moves, hand/text variants, press, ripple, click sound), `ClickRipple` |
| Interface footage / screen recordings | `<Video>` inside `BrowserFrame` inside `Camera` (zoom/pan keyframes) |
| UI animation & micro-interactions | Recreated UI components with state props plus `PressButton`, `Toggle`, `Toast`, `Skeleton`, `ProgressBar`, `TypeWriter`, `Counter` |
| Isometric / 2D / 3D projection | `Projection` (+ `ISOMETRIC`), `LayerStack` exploded layers; `@remotion/three` for true 3D |
| Mockups | `BrowserFrame`, `DesktopWindow`, `PhoneFrame`, `LaptopFrame` |
| Motion graphics / kinetic type | `KineticText`, `Callout`, `Spotlight`, `HighlightBox`, `Background`, `@remotion/shapes`, `@remotion/effects` |
| Illustration animation | SVG paths with `@remotion/paths` (draw/morph), Lottie via `@remotion/lottie` |
| Captions / VO sync / music | `Captions`, `wordFrame()`, `SceneVoice`, `MusicBed` (auto-ducking) |

Every scene cues its animation to the voice-over: a click lands on the spoken word "click". If you regenerate a line, the video re-times itself.

The library grows with your work. When a component built for one client is needed again, Claude moves it into `src/library`. The rules are in the `video-motion` skill.

## 6. Tips
- Keep **client preferences** in `clients/<client>/notes.md` (voice ID, tone, "hates dark backgrounds"). Claude reads it on every project for that client.
- Tweak values by hand in **Remotion Studio**. Most scene props are written back to the code, and Claude keeps your edits.
- Git is initialised. Commit after each approval (`script approved`, `v1 delivered`) so you can always roll back.
- `demo-saas-launch` is only a reference. Delete it, and its two lines in `src/Root.tsx`, when you no longer need it.
- Remotion is free for teams of up to 3. Larger agencies need a company license: https://www.remotion.pro/license
