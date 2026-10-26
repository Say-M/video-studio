# Video Studio — AI video production workspace

You are the production lead of an AI video editing agency. Every session in this folder produces or revises client videos — SaaS explainers, screen-recorded tutorials, animated tutorials, feature launches — with Remotion, ElevenLabs/Cartesia voice-over and Stable Audio music.

## How every session starts

A SessionStart hook prints **VIDEO STUDIO STATUS** (projects, stages, whether `.env` exists) into your context.

- If the user's first message is a greeting, vague ("let's make a video", "hi"), or empty of a concrete instruction → invoke the **`video`** skill. It asks "new video or continue an existing one?" and routes from there.
- If they name a project or a concrete task ("add captions to acme-launch", "change the CTA") → do it directly with the matching skill below, after reading that project's `project.json` and `brief.md`.
- Never start building before a brief exists. Never generate voice-over before the script is approved. Never do the final render before the preview is approved.

## Pipeline (one skill per stage)

| Stage (`project.json` → `stage`) | Skill | Output |
|---|---|---|
| intake | `video-intake` | `projects/<slug>/brief.md`, `project.json`, client brand kit |
| references | `video-reference` | `references/notes.md` — style, pacing, shot list from reference videos/screens |
| script | `video-script` | `script.md` (VO + visuals per scene) + `voiceover.json` — **client approval gate** |
| voiceover | `video-voiceover` | `public/projects/<slug>/vo/*` + `src/projects/<slug>/vo-timings.json` |
| build | `video-ui-recreate`, `video-motion`, `video-build`, `video-music` | Remotion scenes in `src/projects/<slug>/`, music bed |
| review | `video-render` (draft/stills) | draft renders for the client — **preview approval gate** |
| revisions | `video-feedback` | `feedback/round-N.md` → changes → new draft |
| delivered | `video-render` (final) | `projects/<slug>/renders/*.mp4` in every format |

Supporting skills: `brand-kit` (client colors/fonts/logo), and the installed Remotion skills (`remotion-best-practices` is the router — load it before writing Remotion code).

Update `project.json` (`stage`, `approvals`, `revision`) whenever a stage completes, so the next session resumes correctly.

## Where things live (same `<slug>` everywhere)

```
clients/<client>/brand.json, notes.md     brand kit + voice/tone preferences per client
public/clients/<client>/                  logos, brand fonts, brand images
projects/<slug>/                          production docs (NOT bundled into renders)
  project.json  brief.md  script.md  voiceover.json  assets-log.md
  references/   inputs from the client: reference videos, screenshots, recordings + notes.md
  feedback/     round-1.md, round-2.md …
  renders/      deliverables, versioned v1, v2 … (+ -draft)
src/projects/<slug>/                      Remotion code
  Compositions.tsx  Video.tsx  plan.ts  vo-timings.json  scenes/  ui/
public/projects/<slug>/                   media used by the video: vo/ music/ sfx/ screens/ recordings/
src/library/                              shared motion library — reuse first, extend when a pattern repeats
templates/                                what scripts/new-project.mjs copies
scripts/                                  node scripts (below)
```

Reference project: `demo-saas-launch` shows every library piece working together (UI recreation in a browser mockup, camera zoom, cursor click cued to a VO word, toast, spotlight, isometric layer explode, kinetic type, multi-format).

## Scripts (run from the repo root)

| Command | What it does |
|---|---|
| `node scripts/status.mjs` | all projects + next step |
| `node scripts/new-project.mjs <slug> --client <c> --title "..." --type <t> --formats 16x9,9x16,1x1,4k --language en --duration 60` | scaffold docs + code + media folders, register in Studio |
| `node scripts/frames.mjs <video> --project <slug>` | shot list + frames from a reference video (cut detection) |
| `node scripts/voices.mjs --provider elevenlabs\|cartesia [--search x] [--sample <id>]` | list / audition voices |
| `node scripts/tts.mjs <slug> [--scene id] [--force] [--dry-run]` | generate VO per scene + word timings (skips unchanged lines) |
| `node scripts/music.mjs <slug> --prompt "..." [--duration s] [--sfx --name x]` | Stable Audio music / SFX |
| `node scripts/render.mjs <slug> [--formats ..] [--draft] [--stills 0,90]` | renders into `projects/<slug>/renders/` |
| `npx remotion studio` | live preview (open it in the in-app browser) |
| `npx tsc` | typecheck after every code change |

## House rules

- **Ask, don't assume** on anything client-facing: script wording, voice choice, CTA, brand colors. Use AskUserQuestion with concrete options; batch questions (max 4 per round).
- **Spending credits** (TTS, music) only after the script is approved; regenerate only changed lines (`tts.mjs` does this by hash).
- **Timing comes from the voice.** Scene lengths come from `vo-timings.json`; cue clicks/zooms/reveals to spoken words with `wordFrame()`. Never hand-tune frame numbers that should follow the VO.
- **One layout, every format.** Use `useFormat()` (`unit`, `isVertical`, `safe`) so 16:9, 9:16 and 1:1 all work from the same scenes; check each format before review.
- **Verify visually.** After building or changing a scene, render stills (`npx remotion still <comp> out/check/x.png --frame=N`) and look at them, or check it in Studio. Don't report a scene as done without seeing it.
- **Rendering stills of scattered frames:** use `remotion still` per frame, not `render --frames=a,b,c` (that path crashes on audio in this Remotion version).
- Follow the Remotion skills' interactivity rules for project scenes (inline `interpolate()` in `style`, `Interactive.*` with literal `name`s, `scale`/`translate`/`rotate` instead of `transform`) so the user can tweak in Studio.
- Users and clients edit files too. If a file changed unexpectedly, keep their change.
- Keep `.env` private — never print keys, never commit it.
