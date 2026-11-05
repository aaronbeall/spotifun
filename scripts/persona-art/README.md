# Persona portraits

Source for the 64 hand-drawn listener persona portraits in `public/personas/`.

Each character is an SVG illustration built in code. `kit.js` holds the shared look: flat colour, a cel-shade crescent, ink lines tinted from each part's own colour, a wobble filter for the hand-drawn line, paper grain, and the record base every character stands on. `parts.js` adds reusable faces, ears and music props. `fam1.js` to `fam8.js` hold the characters, in the same order as `MUSIC_PERSONAS`, keyed by persona id.

To re-render a family (needs Playwright with Chromium):

    cd scripts/persona-art
    mkdir -p out
    node fam.mjs fam3                       # every character in fam3, plus a contact sheet at out/fam3.png
    node fam.mjs fam3 the-indie-devotee     # just one character

Then convert `out/<id>.png` to a 768px WebP in `public/personas/<id>.webp`. Character names and bios live in `src/utils/personaCharacters.ts`.
