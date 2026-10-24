# Design refresh and SEO / GEO / AEO pass — 24 October 2026

Scope and limits: the live site was not reachable from the build environment, so everything below was verified on the production build (`npm run build`) served locally, in Chromium at 360, 390, 768, 1366 and 1440 px, light and dark. No Search Console, ranking or Core Web Vitals field data was available.

## Design

- **One token-based design system** (`src/index.css`, tokens at the top): light and dark are both first-class and default to the visitor's OS setting until they choose (saved as `anytool-theme`). An inline script in `index.html` sets the theme before first paint (no flash).
- The old stylesheet layered many dark-only rules with light overrides, which left unreadable text (result values, chips, stats) in the light theme. Components now read tokens only; legacy Tailwind colour classes used inside tools are remapped to tokens so every tool is legible in both themes. Widget stages that are dark by design (picker wheel, timer, love/zodiac, calculator) live in `src/styles/widgets.css` and keep their own palette.
- **Home:** search-first hero with four popular tools, replacing the third-party Unsplash photo (faster LCP, no external dependency or attribution). FAQ is now accessible `<details>` accordions.
- **Header:** opaque sticky bar, clearer nav, language/theme/account controls; mobile menu.
- **Mobile:** the persistent sidebar no longer fills the first screen on phones/tablets (it shows from 1280 px; the tool pages keep their compact menu).
- RTL (Arabic, Urdu) and Traditional Chinese layouts checked.

## SEO / GEO / AEO

- Social cards now use a raster 1200×630 `public/og-default.png` on every page (SVGs are ignored by most platforms). Regenerate with `node scripts/generate-og-image.mjs`.
- Home pages (all four languages) now carry **FAQPage** JSON-LD in the prerendered HTML, generated from the same data as the visible FAQ (`src/data/homeFaq.js`).
- Prerendered fallback HTML no longer paints a hard-coded dark background (it flashed dark before hydration in the light theme) and its `<h1>` matches the live page (no brand suffix).
- `robots.txt` explicitly allows OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot and Perplexity-User; private routes still rely on `X-Robots-Tag: noindex` (not blocked, so crawlers can see it).
- Build assertions added in `scripts/dist-test.mjs` for all of the above.
- Already in place and kept: canonicals, hreflang + x-default, sitemap with 320 URLs, SoftwareApplication / BreadcrumbList / WebSite / Organization JSON-LD, `llms.txt`, `tool-catalog.json`.

## Verification

- `npm test` and `npm run build` (320 localized pages, 62 tools × 4 locales) pass.
- Existing Playwright suite: 44/44 pass. Two Ctrl+K tests were racing hydration (they failed on the original build too); they now wait for the page to render first. One assertion that required the removed Unsplash hero now checks the new showcase.
- Sweep of 76 URLs × 3 viewports (228 loads): 0 horizontal overflow, 0 page errors, 0 HTTP errors, exactly one `<h1>` per page. The only broken image is the owner photo on `/about`, hosted on Cloudinary, which the sandbox network could not reach.

## Still needs a human

1. Search Console: confirm the sitemap, inspect a few URLs, and watch index coverage after deploy.
2. Measure Core Web Vitals in the field (CrUX / PageSpeed Insights) after deploy.
3. Per-tool social images (currently one shared image) and unique, hand-written tool descriptions would help click-through further.
4. Indexing and ranking are Google's decision; these changes remove technical obstacles but do not guarantee positions.
