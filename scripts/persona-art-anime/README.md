# Persona art: moody anime experiment (not in use)

A shelved try at redrawing the 64 persona portraits in a moody anime style.
The live portraits are the hand-drawn set in `scripts/persona-art/`.

- `kit.js`: drawing primitives (cel shading with drawn terminators, rim light, anime eyes, bloom and grade).
- `lib.js`: reusable 3/4 creature head, bust clothing, props and night scenes.
- `chars/`: the four finished test portraits (Goldie, Volta, Basil, Baron), rendered in `renders/`.
- `fam1.js`: first eight personas, partly written and never rendered.
- `prompts.json` / `prompts.py`: a style guide plus one image-generator prompt per persona, in case an image model is used later.

Render with `node render.mjs goldie volta basil baron` (uses the preinstalled Playwright Chromium).
