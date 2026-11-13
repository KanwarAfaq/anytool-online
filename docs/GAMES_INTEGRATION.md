# Integrated browser games (AnyTool)

**Public pages:** https://anytool.online/games and `/games/<slug>` for 13 titles.

## Source and maintenance

Playable runtime for all thirteen games and the compiled 3D engines is **committed inside this repository**:

- `public/games/*.html` — ten 2D games and three standalone 3D launch documents; raw HTML frames are noindex and canonical to `/games/<slug>`
- `public/assets/{css,img,js}/` — same-origin thumbnails and game resources
- `public/play/{lumenfall,neon-velocity,starfall-protocol}/` — the compiled 3D games including required JS, styles and models
- `scripts/arcade-embed.css` — hides duplicated Kanwar Arcade navigation, scales canvases, and preserves touch controls in `?embed=1` mode
- `scripts/vendor-arcade.mjs` and `.github/workflows/vendor-arcade.yml` — reproducible vendoring from the pinned source repo `KanwarAfaq/games` (source SHA recorded in `public/arcade-manifest.json`)

The games are **not** downloaded from the old site at runtime and do **not** enter the normal Vite bundle. The React Arcade page remains a lazy-loaded route, and the player iframe mounts only after the visitor chooses **Start game**. Switching games unloads the previous frame.

To sync future changes from the original games source, review the upstream commit, change `GAMES_COMMIT` in the vendor workflow, and run **Vendor playable arcade games into AnyTool**. This commits static runtime files into this repository, preserving a verifiable version history.

## Mobile and desktop support

| Title | Mobile controls | Note |
|---|---|---|
| Starfall, Brick Rally, Serpentine, Skyhop, Lightmerge, Driftrock | Built-in touch/swipe | Responsive 2D game embeds |
| Aether Run, Moonlit Grove, Park Dash, Serpent Studio | Built-in on-screen buttons | Responsive mobile player |
| Neon Velocity | AnyTool virtual steering/acceleration/nitro buttons | 3D performance varies by device; best on desktop |
| Lumenfall, Starfall Protocol | Requires keyboard and mouse | Responsive *page* but the game engine is desktop-oriented; not claimed to be fully touch playable |

The **Fullscreen** button requests fullscreen on supported browsers and falls back to a new tab when not supported (e.g. some Safari configurations). The frame is unloaded on **Reset**, freeing WebGL memory. Mobile and desktop layouts are checked in Playwright.

## SEO and loading

The canonical `/games/<slug>` pages include pre-rendered descriptions, instructions, and lightweight preview images. Raw runtime documents have `noindex,follow` to avoid duplicate low-content index pages. Keep the old games origin temporarily as rollback; only consider 301 redirecting that origin after verifying game compatibility on real devices and deciding to retire the standalone domain.

Performance: Only the lightweight catalog page, icons, and lazy thumbnails load when browsing games. Playable JavaScript, models and WebGL are fetched exclusively after a game is started, not on the main AnyTool homepage. Monitor mobile Core Web Vitals separately from game execution.
