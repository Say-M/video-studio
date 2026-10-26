---
name: video-intake
description: Start a new client video — interview the user for the brief (product, goal, audience, type, length, language, formats, style, voice, music, references, inputs), scaffold the project with scripts/new-project.mjs, file the inputs, and write brief.md. Use for "new video", "new project", or when a project's stage is intake.
---

# Video intake

Outcome: a scaffolded project with a complete `projects/<slug>/brief.md`, inputs filed, and `stage` advanced. Keep it fast — the user runs an agency and does this daily.

## 1. Gather what's already there

Before asking anything:
- Read anything the user pasted or attached (brief text, links, file paths). Extract every answer you can.
- Check `clients/` for an existing client — reuse its `brand.json` and `notes.md` (preferred voice, tone, do/don't). Past projects for that client (`projects/*/project.json` with the same client) are good defaults for format, voice and style.

## 2. Ask in rounds (AskUserQuestion, max 4 questions per round)

Only ask what you could not infer. Offer concrete options with a recommended default first.

**Round 1 — the job**
1. Client (existing ones as options + "new client")
2. Video type: `Feature launch / announcement`, `Screen-recorded tutorial`, `Animated tutorial (recreated UI)`, `Product explainer / promo` (Other: onboarding, changelog, social ad…)
3. Length: `~30s`, `~60s`, `~90s`, `2–3 min`
4. Formats (multiSelect): `16:9 1080p`, `9:16 vertical`, `1:1 square`, `4K 16:9`

**Round 2 — content & language**
1. Language of the voice-over (and on-screen text if different)
2. Script: `I'll paste/attach a script`, `Write it from my notes`, `Write it from the product site/screens`
3. Inputs available (multiSelect): `Reference video(s)`, `Screenshots`, `Screen recordings`, `Brand assets (logo/fonts)`
4. Captions: `Burned-in on vertical only` (recommended), `All formats`, `None`

**Round 3 — look & sound** (skip what the client's notes already answer)
1. Visual style: `Clean 2D UI + motion graphics`, `Isometric / 3D projection`, `Device mockups (browser/phone/laptop)`, `Illustrated / character` — multiSelect
2. Motion feel: `Calm & premium`, `Snappy & energetic`, `Playful`
3. Voice: provider (`ElevenLabs`, `Cartesia`) + gender/accent/tone — or a known voice id from client notes
4. Music: `Minimal electronic / tech`, `Corporate uplifting`, `Lo-fi / chill`, `Cinematic` (or "no music")

Also ask in free text if missing: product name + one-line value prop, target audience, the 1–3 key messages, the exact CTA (text + URL), must-include / must-avoid, deadline.

## 3. Scaffold

Pick a slug: `<client>-<topic>` lowercase-hyphenated, e.g. `acme-reports-launch`.

```bash
node scripts/new-project.mjs <slug> --client <client> --title "<Title>" --type <type> --formats 16x9,9x16 --language en --duration 60
```

Types: `feature-launch`, `screen-tutorial`, `animated-tutorial`, `explainer`, `promo`, `onboarding`, `changelog`.

If the client is new → run the `brand-kit` skill now (colors, fonts, logo), or note it as an open question.

## 4. File the inputs

Copy (never move the user's originals) into the project:
- Reference videos, client screenshots for study, existing scripts, docs → `projects/<slug>/references/`
- Screenshots / recordings / images that will **appear in the video** → `public/projects/<slug>/screens/` and `.../recordings/` (Remotion can only load from `public/`)
- Logos / brand fonts → `public/clients/<client>/`

Use clear names: `ref-01-competitor-launch.mp4`, `screen-dashboard-empty.png`, `rec-create-report.mp4`.

## 5. Write the brief

Fill every section of `projects/<slug>/brief.md` (template already in place). Under **Inputs received** list each file with its path and what it's for. Put unresolved items under **Open questions** — don't invent client facts.

Update `project.json`: `voice` (provider, voiceId if known, speed, language), `music.prompt` idea, `targetDuration`, and `stage`:
- `references` if there are reference videos/screens to analyse
- otherwise `script`

## 6. Hand off

Show the user a 5–8 line summary of the brief and ask: "Brief OK? Next I'll analyse the references / write the script." Then continue with `video-reference` or `video-script`.
