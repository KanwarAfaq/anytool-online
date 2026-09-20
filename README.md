# AnyTool.online

Production utility platform for **https://anytool.online**.

## Stack
- Vite + React + JavaScript
- Tailwind CSS v4
- Supabase Auth + Postgres + Row Level Security
- Cloudinary as an internal signed-file layer
- Vercel frontend + serverless APIs
- Multi-provider AI gateway
- Playwright browser E2E tests
- Build-time multipage SEO output + multilingual sitemap + indexable tool preview images

## Public languages
- English: `/`
- Traditional Chinese: `/zh-tw/`
- Arabic: `/ar/` (RTL)
- Urdu: `/ur/` (RTL)

Each public tool and trust page has localized route variants, canonical metadata and hreflang relationships.

## SEO / GEO
The production build generates:
- unique tool titles and meta descriptions
- canonical URLs
- hreflang + x-default
- Open Graph and Twitter metadata
- `SoftwareApplication`, `BreadcrumbList`, `WebSite` and `Organization` JSON-LD
- category hub pages
- `/sitemap.xml`
- `/robots.txt`
- `/llms.txt`
- About, Contact, Privacy, Methodology and Official Sources pages

Private account routes are excluded from the sitemap and receive `noindex`.

## Source-backed Taiwan tools
Regulated tools show official source evidence and last-reviewed dates. High-value sources are monitored by:
- `.github/workflows/source-monitor.yml` — daily official-source checks
- `.github/workflows/seo-audit.yml` — weekly build/search-readiness audit

A source change is flagged for review; formulas are not silently rewritten by AI.

## AI routing
Vision/OCR fallback:
1. Gemini
2. Mistral
3. OpenRouter

Text fallback:
1. Groq
2. NVIDIA NIM
3. Gemini
4. Mistral
5. OpenRouter

Provider keys stay server-side.

## Vercel environment variables
Required:
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `NVIDIA_NIM_API_KEY`
- `MISTRAL_API_KEY`
- `OPENROUTER_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional:
- `GEMINI_MODEL`
- `GROQ_MODEL`
- `NVIDIA_MODEL`
- `MISTRAL_VISION_MODEL`
- `MISTRAL_OCR_MODEL`
- `MISTRAL_TEXT_MODEL`
- `OPENROUTER_MODEL`
- `OPENROUTER_VISION_MODEL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_AI_GATEWAY_URL`

Never expose service-role keys, SMTP credentials, Cloudinary secrets or AI provider keys in `VITE_*` variables.

## Supabase Auth email
The frontend supports:
- email/password sign up and sign in
- email OTP / magic-link flow
- forgot-password email
- password reset

For production email delivery, configure **Authentication → Emails → SMTP Settings** in Supabase. For Google SMTP, use an App Password rather than a normal Google password. Keep SMTP credentials in Supabase; do not commit them.

For a typed OTP email, configure the Supabase magic-link/OTP email template to include the generated token. Otherwise the same frontend also supports the secure email link flow.

## Database
Migrations under `supabase/migrations/` create/extend:
- profiles
- favorites
- tool events
- AI usage
- internal upload records
- contact messages
- official-source review queue

All user-owned data uses RLS.

## Local development
```bash
npm install
npm run dev
```

Tests:
```bash
npm test
npm run build
npm run test:e2e
```

## Privacy
Image resize/conversion, QR utilities and PDF merge/split run locally in the browser where practical. AI file tasks require an authenticated session and send only the user-selected file to the configured AI gateway.
