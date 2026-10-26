---
name: video-ui-recreate
description: Recreate a client's product interface from screenshots, screen recordings or reference frames as animatable React components for Remotion — pixel-faithful layout, state props for animation, and exported hotspot coordinates for cursor/camera/spotlight targeting. Use when a scene needs the product UI (dashboards, forms, modals, mobile screens) animated rather than shown as flat footage.
---

# Recreate product UI as Remotion components

Reference implementation: `src/projects/demo-saas-launch/ui/Dashboard.tsx` (used by `scenes/GenerateScene.tsx`).

## When to recreate vs. use footage

| Recreate (React) | Use screenshot/recording as footage |
|---|---|
| Things change inside the UI (typing, toggles, loading → data, new rows) | The UI is static, or the recording already shows the action well |
| Need crisp 2–3× zooms | Zoom ≤ 1.5× on a sharp 1080p+ source |
| Data must be clean / on-brand / anonymised | Real data is fine |
| Vertical/square versions need a re-layout | One format only |
| Isometric / 3D / exploded layer shots | — |

Mixed is common: screenshot as the background layer, recreated pieces (a modal, a card, a button) animated on top in the exact same position.

## 1. Measure the reference
- Put screenshots in `public/projects/<slug>/screens/`. Get their size (`npx remotion ffprobe -v error -show_entries stream=width,height -of csv=p=0 <file>`).
- Lay the component out at the screenshot's **native CSS size** (e.g. 1440×900 for a 2880×1800 retina capture — divide by the device pixel ratio). Phone UIs: 390×844 (fits `PhoneFrame`).
- Read the screenshot (Read tool) and note: grid/columns, paddings, font sizes, weights, colors (sample exact hex values where possible), radii, shadows, icon style.
- Use the product's real font if it's a Google Font (load it in `Video.tsx`), otherwise the closest match.

## 2. Build the component (`src/projects/<slug>/ui/<Screen>.tsx`)

Rules:
- **Fixed-size root** (`width`/`height` = native size), absolute or flex layout inside, `boxSizing: 'border-box'` on padded boxes so measurements stay predictable.
- **Explicit heights** for rows/cards you'll target, so hotspot coordinates are exact.
- **State via props, not frames**: `report: 0 | 0.5 | 1`, `typedText: string`, `hover: number`, `press: number`, `selectedTab: 'a' | 'b'`, `rows: Row[]`. The scene owns timing (`interpolate`, `wordFrame`) and passes values down. Pass `frame` only for ambient effects (shimmer, spinner).
- **Export `HOTSPOTS`**: `{name: {x, y, width, height}}` in the component's own pixel space for every element the cursor clicks, the camera zooms to or a spotlight highlights. Export a `center()` helper.
- Reuse library micro-interactions inside the UI: `PressButton`, `Toggle`, `ProgressBar`, `Skeleton`, `TypeWriter`, `Counter`, `Toast`.
- Icons: inline SVG paths (simple strokes); keep them consistent with the product (outline vs filled).
- Simplify: drop UI that doesn't serve the step (extra nav items, tiny metadata). The viewer has ~3 seconds per screen.
- No CSS transitions/animations — everything is frame-driven.

## 3. Verify against the reference
Render the component in its scene at the moment it's static and compare side by side with the screenshot:
```bash
npx remotion still <slug>-16x9 out/check/ui.png --frame=<N>
```
Read both images. Fix spacing/size/color mismatches until it's indistinguishable at a glance. Then overlay a debug rect on each hotspot once (temporary `<div style={{position:'absolute', outline:'2px solid red', ...HOTSPOTS.x}}/>`) to confirm the coordinates, and remove it.

## 4. Place it in the scene (stage pattern)
The scene uses a 1920×1080 **stage** that the `Camera` moves over. The UI sits inside a mockup at a known offset; convert UI coordinates to stage coordinates:
```ts
const FRAME = {x: (1920 - UI.width) / 2, y: (1080 - (UI.height + TOOLBAR)) / 2};
const toStage = (p) => ({x: FRAME.x + p.x, y: FRAME.y + TOOLBAR + p.y});
```
Cursor, Spotlight and HighlightBox go **inside** the Camera (stage coordinates, they zoom with the UI); toasts/captions/titles go outside (screen space). See `GenerateScene.tsx`.

## Mobile apps
Lay out at 390×844 inside `PhoneFrame` (`PHONE_SCREEN` constant). Use `ClickRipple` (tap) instead of the arrow cursor, or `Cursor` with `variant="hand"` and a large `size`.

## Desktop apps / terminals
`DesktopWindow` for native apps; for terminals use a monospace font, dark background and `TypeWriter` with `cps` ≈ 30 for commands and instant output blocks.
