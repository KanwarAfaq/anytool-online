# Kanwar Arcade

Nine free games that run in the browser, wrapped in a small static website.

- **Starfall**: a vertical space shooter with waves, power-ups and a boss every fourth wave.
- **Brick Rally**: a brick-breaker with five levels, power-ups and a streak multiplier.
- **Serpentine**: a glowing snake game with combo fruit and rocks.
- **Skyhop**: a one-tap flyer through a sky that changes from dawn to night.
- **Park Dash**: a kids-only running race on foot (no vehicles), with animated rivals, hurdles, stars and sprinting.
- **Serpent Studio**: four snake modes (Classic, Zen, Sprint, Maze), three speed settings and four neon skins.
- **Aether Run**: a cinematic neon hover racer with energy management, speed boosts and a procedural skyline.
- **Moonlit Grove**: an enchanted fantasy survival arena with spellcasting, enemies and wave progression.
- **Lumenfall**: a 3D adventure (React, Three.js, Rapier). Source in `lumenfall/`, built output in `play/lumenfall/`.
- **Neon Velocity**: a 3D arcade racer. Source in `neon-velocity/`, built output in `play/neon-velocity/`.
- **Starfall Protocol**: a 3D top-down shooter. Source in `starfall-protocol/`, built output in `play/starfall-protocol/`.
- **Lightmerge** (2048-style puzzle) and **Driftrock** (asteroids shooter) are 2D games on the shared `Arcade` engine in `assets/js/`.

The 2D games and pages (including all four featured games) have no framework, no build step and no dependencies. Vercel serves the repo root as-is.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Project layout

```
index.html            Landing page
contact.html, 404.html
games/                One page per game
assets/               CSS, JS (common.js + one file per 2D game), images
lumenfall/            Lumenfall source (Vite + React + Three.js)
play/<game>/          Production builds of the 3D games, committed so Vercel needs no build step
scripts/build.mjs     Generates pages, sitemap, robots, llms.txt, manifest, sw.js and vercel.json
scripts/make-og.py    Generates the social share images
```

## Add a game

1. Write `assets/js/<game>.js` using the helpers in `assets/js/common.js` or a standalone engine, and add a thumbnail to `assets/img/`.
2. Add an entry to the `GAMES` list in `scripts/build.mjs`.
3. Run `node scripts/build.mjs` and commit the regenerated HTML.

## Contact form

With no server, the form opens a prefilled GitHub issue. To send email instead, set `CONTACT_EMAIL` at the top of `assets/js/contact.js`.

## Update Lumenfall

```bash
cd lumenfall && npm ci
npx vite build --base=/play/lumenfall/ --outDir ../play/lumenfall --emptyOutDir
```

Commit the refreshed `play/lumenfall/` folder.

Neon Velocity and Starfall Protocol rebuild the same way: `cd neon-velocity && npm ci && npx vite build --base=/play/neon-velocity/ --outDir ../play/neon-velocity --emptyOutDir` (and likewise for `starfall-protocol`).

## SEO, answer engines and AI search

`node scripts/build.mjs` writes canonical URLs, Open Graph and Twitter cards, JSON-LD (WebSite, Organization, VideoGame, FAQPage, BreadcrumbList, ItemList), `sitemap.xml`, `robots.txt` (AI crawlers allowed), `llms.txt` and `llms-full.txt`. Set your real domain before going live:

```bash
SITE_URL=https://your-domain.com node scripts/build.mjs
```

After deploying, submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools. The IndexNow key file is `<key>.txt` in the repo root.

## New premium games: testing and deployment

- Aether Run: `/games/aether-run.html` (keyboard: A/D or arrows, Shift/Up to boost; mobile: steer and boost buttons).
- Moonlit Grove: `/games/moonlit-grove.html` (WASD/arrows movement, pointer aiming, auto-casting, Space/Shift dash; touch drag).
- Both games generate all artwork and sound in the browser, with persistent high scores and mute controls. Audio begins only after a user starts or interacts with the game.
- `node scripts/build.mjs` regenerates the homepage, directory, structured data and sitemap, preserving bespoke game HTML. `node scripts/test-premium.mjs` smoke-tests both canvas engines and regenerated links.
- The `premium-games.yml` workflow runs JavaScript syntax checks, page generation and deterministic gameplay smoke tests, then commits the static assets to the feature branch for Vercel.


## New games and dashboard (November 2026)

- **Park Dash**: `games/park-dash.html` — running race with four animated kid runners. Arrow keys / A-D change lanes; Space / W jump; Shift sprints. Touch controls supported.
- **Serpent Studio**: `games/serpent-studio.html` — four selectable game modes, three speeds and four skins. Arrow keys / WASD or swipe to turn; best scores saved by mode and speed.
- The homepage highlights **Park Dash, Serpent Studio, Aether Run and Moonlit Grove** in a featured section; all **nine games** also appear in the main dashboard grid and sidebar.
- `node scripts/build.mjs` regenerates the dashboard, sidebar, metadata, sitemap and service worker without overwriting bespoke premium game pages.
- `node scripts/test-premium.mjs` runs browser-independent Canvas game smoke tests for all four premium engines, including all snake modes.
- `.github/workflows/premium-games.yml` verifies and commits generated site assets on the feature branch so the Vercel static deployment needs no build step.
