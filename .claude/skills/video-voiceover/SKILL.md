---
name: video-voiceover
description: Generate voice-over with ElevenLabs or Cartesia per scene, with word-level timestamps that drive scene durations and animation cues — choose/audition a voice, run scripts/tts.mjs, fix pronunciation and pacing, regenerate single lines. Use after script approval, when the user wants a different voice, or when a VO line changes.
---

# Voice-over

`scripts/tts.mjs` turns `projects/<slug>/voiceover.json` into one audio file per scene in `public/projects/<slug>/vo/` and writes `src/projects/<slug>/vo-timings.json` (duration + word timestamps). The video re-times itself from that file: `buildTimeline()` sizes scenes, `wordFrame()` cues animations, `SceneVoice` plays each line, `Captions` uses the words.

## Preconditions
- Script approved (`approvals.script` set). If not, stop and get approval first — TTS costs credits.
- `.env` has `ELEVENLABS_API_KEY` or `CARTESIA_API_KEY`.

## 1. Choose the voice

Check in this order: `project.json` → `voice`, the client's `notes.md`, `.env` defaults. If none, help the user pick:

```bash
node scripts/voices.mjs --provider elevenlabs --search "british"
node scripts/voices.mjs --provider elevenlabs --sample <voiceId> --text "<first line of the script>"
node scripts/voices.mjs --provider cartesia --search narrator
node scripts/voices.mjs --provider cartesia --sample <voiceId> --text "..." --language en
```

Samples land in `out/voice-samples/` — tell the user the paths so they can listen. Offer 2–3 shortlisted voices with a one-line description each.

Provider guidance:
- **ElevenLabs** `eleven_multilingual_v2`: most natural, best for English & major languages; auto-detects language. Settings: `stability` 0.4–0.6 (lower = more expressive), `similarity` 0.75, `style` 0–0.3, `speed` 0.9–1.1.
- **Cartesia** `sonic-3.6`: fast, consistent, good multilingual coverage; set `language` (e.g. `en`, `bn`, `hi`, `es`); `speed` 0.6–1.5; optional `emotion`.

Save the choice in `project.json`:
```json
"voice": {"provider": "elevenlabs", "voiceId": "…", "model": "eleven_multilingual_v2", "speed": 1, "language": "en", "stability": 0.5, "similarity": 0.75, "style": 0.15}
```
and in `clients/<client>/notes.md` once the client approves it.

## 2. Generate

```bash
node scripts/tts.mjs <slug> --dry-run     # what will be generated
node scripts/tts.mjs <slug>               # generate missing/changed lines only
node scripts/tts.mjs <slug> --scene s03-how,s04-cta   # just these
node scripts/tts.mjs <slug> --force       # everything (e.g. after changing voice)
```

Unchanged lines (same text + voice settings hash) are skipped, so revisions only pay for what changed. Every generation is logged in `projects/<slug>/assets-log.md`.

## 3. Check
- Total VO vs target length (printed at the end). Over by >10% → tighten the script (ask the user) or raise `speed` slightly (max ~1.1 before it sounds rushed).
- Listen-proxy checks you can do: word timestamps present for every scene (needed for cues/captions); no scene with a suspiciously long duration for its word count (a sign of mispronounced spelled-out text or long pauses).
- Ask the user to listen in Studio (`npx remotion studio`, open the composition) before building on top of it.

## 4. Fixing lines
- Mispronunciation → respell in `voiceover.json` only ("Kubernetes" → "koo-ber-net-eez"), keep the correct spelling in `script.md`'s on-screen column. Regenerate that scene.
- Wrong emphasis → rephrase or punctuate (commas = short pause, period = longer pause, "—" = beat).
- A single line sounds off → regenerate just that scene (`--scene id --force`); ElevenLabs output varies per run.

## 5. Manual VO (user recorded or generated elsewhere)
Put files at `public/projects/<slug>/vo/<scene-id>.mp3`, then write `vo-timings.json` yourself with each file's duration (`npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 <file>`) and `"words": []`. For word cues/captions without TTS timestamps, transcribe with the `remotion-captions` skill (Whisper) and convert its captions to `{text,start,end}` words.

When done: `stage: "build"` in `project.json` → `video-build`.
