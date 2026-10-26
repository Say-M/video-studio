---
name: brand-kit
description: Create or update a client's brand kit — clients/<client>/brand.json (colors, fonts, radius, style), logo and font files in public/clients/<client>/, and notes.md (voice, tone, do/don't). Use when a new client appears, when the user shares brand guidelines/logo/website, or asks to change brand colors or fonts.
---

# Brand kit

Every library component reads the brand through `<BrandProvider brand={brand}>` (see `src/library/theme.tsx`). One accurate brand kit = every video for that client looks on-brand by default.

## Sources (in order of trust)
1. Official brand guidelines / design tokens the user provides
2. Logo files (SVG preferred) and the product UI screenshots
3. The product website — open it in the in-app browser and read colors/fonts from the page (computed styles via `javascript_tool` on `getComputedStyle(document.body)` and the primary buttons)

Never guess silently: if a color is inferred from a screenshot, say so and ask the user to confirm.

## brand.json

Field guide (the real file is plain JSON — no comments; copy `clients/demo/brand.json` as a starting point):

```jsonc
{
  "name": "Acme",
  "colors": {
    "primary": "#…",      // main brand / CTA color
    "secondary": "#…",    // second accent, used in gradients and highlights
    "accent": "#…",       // highlight words, badges
    "background": "#…",   // dark scene background (title/CTA scenes)
    "surface": "#FFFFFF", // cards / UI surfaces
    "text": "#…", "mutedText": "#…", "border": "#…",
    "success": "#22C55E", "danger": "#EF4444"
  },
  "fonts": {"heading": "Poppins, sans-serif", "body": "Inter, sans-serif", "mono": "JetBrains Mono, monospace"},
  "radius": 12,
  "logo": "clients/acme/logo.svg",
  "style": "enterprise, calm, precise"
}
```

## Fonts

- Google Font → in the project's `Video.tsx` (top level):
  ```ts
  import {loadFont} from '@remotion/google-fonts/Poppins';
  loadFont('normal', {weights: ['600', '700', '800'], subsets: ['latin']});
  ```
- Custom font file → put it in `public/clients/<client>/fonts/` and follow `remotion-markup` → `local-fonts.md`.
- Non-Latin languages (Bengali, Arabic, Hindi, CJK…): load a matching Noto font (e.g. `@remotion/google-fonts/NotoSansBengali`) and put it first in the font stack. RTL → read `remotion-markup/arabic-text.md`.

## Logo

Save to `public/clients/<client>/logo.svg` (+ `logo-white.svg` for dark backgrounds if available). Use with `<Img src={staticFile('clients/<client>/logo.svg')} />`.

## notes.md

Keep per-client production memory here: preferred VO provider + voice id + speed, tone of voice, words to avoid, pronunciation of the product name, music taste, past feedback patterns ("always wants bigger text", "no dark backgrounds"). Read it at the start of every project for that client and append new learnings after each feedback round.
