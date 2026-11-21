# Spotifun logo ("Cheeky Cassette")

- `logo.svg`: the main tile with sparkles (also `public/logo.svg`).
- `small.svg`: simplified version for favicons (`src/app/icon.svg`, `favicon.ico`).
- `bleed.svg` / `mask.svg`: full-bleed versions for Apple and PWA maskable icons.

Regenerate the SVGs and every PNG with `node make.mjs <outDir>` (needs Playwright with Chromium), then copy the outputs to `public/`, `public/icons/`, `src/app/` and `assets/`. Build `favicon.ico` from `fav16/32/48.png`.
