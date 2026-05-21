# UN Agent — Security Architecture presentation

A modern slide-deck web app that presents the Prototype 3 architecture
document (Team 1D) in order. Light theme, animated, fully static.

## Contents

```
index.html     the deck (all slides, generated from p3_1D.md)
styles.css     light theme + animations
script.js      slide-deck engine (vanilla JS, no dependencies)
images/        the 20 diagrams / screenshots used in the deck
```

No build step, no `package.json`, no framework.

## Run locally

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy (zero configuration)

This folder is a plain static site. Both platforms detect it with no
settings:

- **Vercel** — `git init`, push, then "Import Project". Framework
  preset: *Other*. Build command: *(none)*. Output directory: `./`.
- **Netlify** — drag the folder into the Netlify dashboard, or connect
  the repo. Build command: *(none)*. Publish directory: `./`.

## Navigation

- `←` / `→`, `PageUp` / `PageDown`, `Space` — move between slides
- `Home` / `End` — first / last slide
- The top-right menu button opens the slide overview
- Swipe left/right on touch devices
- Each slide is deep-linkable via the URL hash
# unagent-presentation-security
