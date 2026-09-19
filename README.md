# AnyTool.online

Production frontend for **https://anytool.online**.

## Stack
- Vite + React + JavaScript
- Tailwind CSS v4 with @tailwindcss/vite
- Supabase for Auth, Postgres, RLS, favorites, usage logs and AI usage
- Cloudinary for signed image/document uploads
- Supabase Edge Function for AI gateway/fallback
- Vercel for frontend and Cloudinary signing endpoint
- Build-time SEO metadata pages and sitemap

## Local setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Vercel variables
Public:
- VITE_SITE_URL=https://anytool.online
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_CLOUDINARY_CLOUD_NAME
- VITE_AI_GATEWAY_URL

Server-only:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Never expose Supabase secret/service-role or AI provider keys in VITE_* variables.

## Supabase
Apply supabase/migrations/202609190001_anytool_core.sql and deploy supabase/functions/ai-gateway with JWT verification enabled.

Edge Function secrets:
- GEMINI_API_KEY
- MISTRAL_API_KEY
- OPENROUTER_API_KEY
- optional provider model overrides

Groq and NVIDIA NIM are reserved for text-capable AI routes; OCR currently routes only through vision-capable providers.

## Privacy
Browser-capable image/PDF operations stay local. Cloudinary uploads use a server-generated signature. Add lifecycle deletion for temporary uploads before public launch.
