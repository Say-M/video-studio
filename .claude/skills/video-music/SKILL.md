---
name: video-music
description: Background music and sound design — write a Stable Audio prompt from the brief, generate a track sized to the video with scripts/music.mjs, add it with ducking under the voice-over, and add UI sound effects (clicks, whooshes, dings) or generate custom SFX. Use during build, or when the user asks for different music or more/less sound design.
---

# Music & SFX

## Music

### 1. Write the prompt (Stable Audio 3 guide)
Order: **track type → genre → main instruments & rhythm → mood/energy → arrangement → production → BPM.** Instrumental only (it isn't built for vocals).

Templates that work for SaaS videos:
- Feature launch: `TrackType: Music, modern minimal electronic instrumental for a SaaS product launch, soft punchy kick, warm analog synth plucks, airy pads, optimistic and confident, builds gently with a lift at the end, clean polished production, 112 BPM`
- Tutorial (sits under talking): `TrackType: Music, calm lo-fi electronic instrumental, soft brushed drums, mellow Rhodes chords, warm sub bass, relaxed and focused, steady with no big drops, light tape warmth, 85 BPM`
- Enterprise / corporate: `TrackType: Music, uplifting corporate instrumental, clean electric guitar arpeggios, light piano, steady claps, positive and trustworthy, gradual build, bright modern mix, 118 BPM`
- Energetic social ad: `TrackType: Music, punchy future-bass instrumental, tight claps, wobbling synth chords, bright plucks, energetic and fun, quick intro, big drop at 4 seconds, 140 BPM`

Match the reference notes (genre/BPM) and the motion feel from the brief. Save the final prompt in `project.json` → `music.prompt`.

### 2. Generate
```bash
node scripts/music.mjs <slug> --prompt "<prompt>"                 # duration = VO total + 4s
node scripts/music.mjs <slug> --prompt "<prompt>" --duration 75 --name alt-1 --seed 42
```
Generate 2 alternatives (`--name main`, `--name alt-1`) when the brief is vague and let the user pick. Keep the seed of the chosen one (logged in `assets-log.md`) for regenerations at a new length.

### 3. Use it
In `src/projects/<slug>/plan.ts`: `export const MUSIC: string | null = 'projects/<slug>/music/main.mp3';`
`Video.tsx` already renders `<MusicBed src={staticFile(MUSIC)} duckRanges={voRanges(scenes, fps, TRANSITION)} />`:
- `volume` 0.35–0.5 for tutorials, 0.5–0.7 for promos; `duckTo` 0.3 (music drops to 30% under VO)
- fades: `fadeInSeconds` 1, `fadeOutSeconds` 2
- If the track is shorter than the video, `loop` is on by default — better: regenerate with the right `--duration`.

Manual music (user supplies a file): put it in `public/projects/<slug>/music/` and set `MUSIC` the same way.

## Sound effects

`src/library/sfx.ts` has a ready UI palette (`SFX.click`, `whoosh`, `whip`, `switch`, `ding`, `pageTurn`, `shutter`, `notification`). The `Cursor` component already plays `SFX.click` on every click (`clickSound={false}` to mute).

Place a one-shot at a frame:
```tsx
<Sequence from={loadedF} durationInFrames={30} layout="none" name="Toast sound">
  <Audio src={SFX.ding} volume={0.35} />
</Sequence>
```

Guidelines: whoosh on big transitions/elements flying in (volume 0.25–0.4), click on every visible click, ding/notification on success states, keep SFX ~10 dB under the VO, don't stack more than 2 at once.

Custom SFX via Stable Audio:
```bash
node scripts/music.mjs <slug> --sfx --prompt "soft glassy UI confirmation chime, short, clean" --duration 2 --name chime
```
→ `staticFile('projects/<slug>/sfx/chime.mp3')`.

The SFX URLs are remote (remotion.media) — renders need internet. For offline renders or a client-specific palette, download/generate files into `public/library/sfx/` and point `sfx.ts` at `staticFile()` paths.
