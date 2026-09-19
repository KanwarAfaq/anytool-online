# AnyTool.online

Production frontend for **https://anytool.online**.

## Stack
- Vite + React + JavaScript
- Tailwind CSS v4
- Supabase Auth + Postgres + RLS
- Cloudinary signed uploads
- Vercel frontend + serverless API
- AI provider routing/fallback
- Build-time SEO metadata + sitemap

## AI routing
- Vision/OCR: Gemini → Mistral → OpenRouter
- Text: Groq → NVIDIA NIM
- Provider keys stay server-side in Vercel.

## Vercel environment variables
Required AI/server variables:
- GEMINI_API_KEY
- GROQ_API_KEY
- NVIDIA_NIM_API_KEY
- MISTRAL_API_KEY
- OPENROUTER_API_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Optional model overrides:
- GEMINI_MODEL
- GROQ_MODEL
- NVIDIA_MODEL
- MISTRAL_VISION_MODEL
- OPENROUTER_VISION_MODEL

The AnyTool Supabase project URL and publishable key are safe client configuration and are included as frontend defaults. They can still be overridden with:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

Never expose service-role keys or AI provider keys in VITE_* variables.

## Local development
```bash
npm install
npm run dev
```

## Database
Migrations under `supabase/migrations/` create profiles, favorites, tool events, uploads and AI usage tables with RLS.

## Privacy
Browser-capable image/PDF operations stay local. Cloudinary uploads use server-generated signatures. AI image requests require an authenticated Supabase session.
