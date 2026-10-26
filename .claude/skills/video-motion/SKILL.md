---
name: video-motion
description: Catalog and choreography guide for the studio's shared motion library (src/library) — cursor interactions with click feedback, virtual camera zoom/pan, browser/phone/laptop/window mockups, isometric and 3D projection, exploded layers, spotlights, callouts, kinetic text, typing, counters, toasts/toggles/buttons, backgrounds, captions, music ducking — plus recipes for SaaS motion styles and when to add new components. Use whenever designing or animating a scene.
---

# Motion library & choreography

Import everything from `src/library` (`import {...} from '../../../library'` inside a scene). Library components are "dumb": they take numbers (progress 0→1, angles, keyframes) and the **scene** decides timing with inline `interpolate()` and `wordFrame()`. Reference usage: `src/projects/demo-saas-launch/scenes/`.

## Catalog

| Need | Component | Key props |
|---|---|---|
| Brand colors/fonts everywhere | `BrandProvider`, `useBrand()` | wrap Video in `<BrandProvider brand={brandJson}>` |
| Format-aware layout | `useFormat()` | `unit` (scale vs 1080p), `isVertical`, `isSquare`, `safe.x/y` |
| VO-driven timing | `buildTimeline`, `getScene`, `wordFrame`, `totalFrames`, `voRanges` | `wordFrame(scene, 'click', fps, {fallbackSeconds, occurrence, edge})` |
| Play a scene's VO | `SceneVoice` | `scene` |
| Cursor | `Cursor` | `path: [{at, x, y, click?, variant?: 'arrow'\|'hand'\|'text', hold?}]`, `arc`, `size`, `clickSound` |
| Tap/click ring alone | `ClickRipple` | `x, y, at` |
| Camera zoom / pan | `Camera` | `keys: [{at, x, y, zoom}]`, `contentWidth/Height`, `clampToEdges` |
| Browser mockup | `BrowserFrame` | `width, height, url, theme, compact` (toolbar 52px compact / 88px tabs) |
| Native window | `DesktopWindow` | `width, height, title, theme` |
| Phone | `PhoneFrame` (+ `PHONE_SCREEN` 390×844) | `width`, `statusBar`, `color` |
| Laptop | `LaptopFrame` | `width`, `screenWidth/Height` (1440×900) |
| 3D tilt / isometric | `Projection` (+ `ISOMETRIC`) | `rotateX/Y/Z`, `perspective` (0 = orthographic) |
| Exploded UI layers | `LayerStack` | `spread` 0→1, `gap`, children = layers |
| Dim all but one element | `Spotlight` | `rect`, `progress`, `dim` |
| Draw-on outline | `HighlightBox` | `rect`, `progress`, `color` |
| Pointer label | `Callout` | `x, y, label, progress, dx, dy` |
| Headline reveal | `KineticText` | `text` (`*word*` = highlight), `startFrame`, `stagger`, `mode: rise\|blur\|pop` |
| Typing | `TypeWriter`, `typingEndFrame()` | `text, startFrame, cps, caret` |
| Animated number | `Counter` | `to, progress, prefix, suffix, decimals` |
| Toast / notification | `Toast` | `title, description, progress, tone` |
| Toggle switch | `Toggle` | `on` 0→1 |
| Button hover/press | `PressButton` | `hover`, `press` 0→1 |
| Progress / upload | `ProgressBar` | `progress` |
| Loading shimmer | `Skeleton` | `width, height, frame` |
| Backgrounds | `Background` | `variant: mesh\|grid\|solid`, `colors`, `base` |
| Captions | `Captions` | `words` (scene.vo.words), `offsetFrames` (scene.voOffset), `maxWords` |
| Music with ducking | `MusicBed` | `src, volume, duckTo, duckRanges` |
| UI sounds | `SFX` | `click, whoosh, whip, switch, ding, pageTurn, shutter, notification` |

Remotion packages already installed: `@remotion/transitions` (fade, slide, wipe, flip, clockWipe…), `@remotion/shapes`, `@remotion/paths` (path morph/draw), `@remotion/effects` (blur, glow, lightLeak, vignette, chromaticAberration… see `remotion-markup` effects), `@remotion/noise`, `@remotion/layout-utils` (fitText, measureText), `@remotion/captions`. Add others with `npx remotion add <pkg>` (e.g. `@remotion/three` for real 3D, `@remotion/lottie` for Lottie illustrations).

## Choreography rules (what makes it look professional)

1. **One focal point per moment.** Camera, spotlight and cursor all point at the same thing; everything else is calm.
2. **Cue to the voice.** Every meaningful action lands on its word: `const clickF = wordFrame(scene, 'click', fps, {fallbackSeconds: 2.5})`. Derive the rest from it (`clickF - 14` hover, `clickF + 1.4 * fps` result).
3. **Anticipate → act → settle.** Camera starts moving ~20 frames before the action, cursor arrives ~10 frames before the click and switches to `hand` over buttons, result appears 6–15 frames after the click, hold ≥ 1s so it reads.
4. **Easing.** Moves: `Easing.bezier(0.65, 0, 0.35, 1)` (in-out). Entrances: `Easing.bezier(0.16, 1, 0.3, 1)` (expo-out). Pops: `Easing.spring({damping: 14})`. Avoid linear except for continuous motion.
5. **Durations @30fps.** Micro-interaction 6–10f · element entrance 12–18f · camera move 20–35f · scene transition 10–15f · text hold ≥ reading time (≈ 0.3s/word + 0.5s).
6. **Layering.** Stage (UI + cursor + spotlight inside `Camera`) → screen-space overlays (toasts, titles, captions) → audio.
7. **Cursor realism.** Slight arc (`arc` 0.1–0.2), never teleport, pauses after clicks (`hold`), don't wiggle. Use `variant: 'text'` over inputs before typing.
8. **Zoom budget.** 1.6–2.2× for focusing a button/field; return wider between steps so viewers keep orientation. Vertical formats: multiply zooms by ~1.75 (`const z = isVertical ? 1.75 : 1`).
9. **Text.** Headline ≥ 84px and supporting ≥ 44px at 1080 (× `unit`), inside `safe`. Max ~7 words per on-screen line.
10. **Sound.** Click SFX on clicks, soft whoosh on big moves, ding on success — subtle.

## Recipes by style

- **Interface footage** (real recording): `<Video src={staticFile('projects/<slug>/recordings/x.mp4')} />` inside `BrowserFrame` inside `Camera`; zoom keys on the moments the VO talks about; `Cursor` overlay only if the recording's own cursor is hidden/too small (or hide it by recreating). Trim with `trimBefore`/`durationInFrames` (see `remotion-markup/video-editing.md`).
- **Screenshot tutorial**: `<Img>` of each step + `Camera` push + `Spotlight`/`HighlightBox` on the target + `Callout` with the step label + numbered step badge; crossfade between steps.
- **UI animation / micro-interactions**: recreated UI (`video-ui-recreate`) with state props driven by frames — typing into fields, toggles flipping, skeleton → content, toast confirmation.
- **Isometric / 2D / 3D projection**: `Projection` with angles animated from 0 → `ISOMETRIC` (flat → iso), `LayerStack` explode for "how it works"; hero tilt `rotateX 18, rotateY -22` with slow drift for product reveals. For true 3D (devices, models): `npx remotion add @remotion/three` + `remotion-markup/3d.md`.
- **Mockups**: `LaptopFrame`/`PhoneFrame` side by side for cross-platform; float with a slow `translate` sine drift (`Math.sin(frame / 40) * 8`px).
- **Illustration animation**: SVG with `Interactive.Path` + `@remotion/paths` (`evolvePath` for line drawing, `interpolatePaths` for morphs), or Lottie files from the client (`remotion-markup/lottie.md`).
- **Motion graphics / kinetic type**: `KineticText`, `Counter` for stats, `@remotion/shapes` for badges/bursts, `@remotion/effects` `glow`/`lightLeak` overlays on transitions.

## Extending the library

When a project needs something new (e.g. a dropdown-open animation, a chart that draws itself), build it in the project's `ui/` first. When the same pattern appears in a second project, move it to `src/library/<area>/`, export it from `src/library/index.ts`, add a row to the catalog above, and keep its API "dumb" (progress values in, no internal timing beyond `useCurrentFrame` for ambient motion).
