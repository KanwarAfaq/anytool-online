# LUMENFALL — The Lost Realm

A premium cinematic 3D browser adventure game built with React Three Fiber, Three.js, and React Three Rapier.

## 🎮 Gameplay

Explore a mysterious fantasy world across three distinct regions:

- **The Forgotten Forest** — Lush greenery, scattered ruins, soft ambient lighting
- **Crystal Valley** — Glowing magical formations, rocky terrain, mysterious lighting
- **The Ancient Sanctuary** — Grand architecture, dramatic lighting, the final portal

**Objective:** Collect all energy crystals, defeat or evade enemies, and activate the final portal to complete the level.

### Controls

| Key | Action |
|-----|--------|
| W / A / S / D | Move |
| Mouse | Camera rotation |
| Shift | Sprint |
| Space | Jump |
| E | Interact |
| Left Click | Attack |
| Esc | Pause |

## 🛠 Tech Stack

- **Vite** — Build tool
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Three.js** — 3D rendering
- **React Three Fiber** — React renderer for Three.js
- **Drei** — Helper components
- **React Three Rapier** — Physics engine
- **Zustand** — Game state management
- **GSAP** — UI animations

## 🚀 Local Development

```bash
# Install dependencies
npm ci

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 GitHub & Vercel Deployment

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: LUMENFALL — The Lost Realm"
git remote add origin https://github.com/YOUR_USERNAME/lumenfall.git
git push -u origin main
```

### Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Vercel auto-detects Vite — use these settings:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`
3. Click **Deploy**

The game will be live at your Vercel URL. Refreshing the page works correctly thanks to the included `vercel.json` configuration.

## 🎨 Features

- ✅ Cinematic 3D environment with three distinct regions
- ✅ Physically-based materials and lighting
- ✅ Bloom, ambient occlusion, and tone mapping post-processing
- ✅ Dynamic procedural terrain and vegetation
- ✅ Animated third-person character with smooth locomotion
- ✅ Responsive third-person camera with collision avoidance
- ✅ React Three Rapier physics
- ✅ Crystal collectibles with pickup animations
- ✅ Enemy AI with patrol, detection, and attack behavior
- ✅ Health system, damage feedback, and respawn
- ✅ Checkpoints system
- ✅ Ambient environmental animations (wind, particles, water)
- ✅ Polished main menu with animated background
- ✅ In-game HUD with health, crystals, and objectives
- ✅ Pause menu, settings, and victory screen
- ✅ Web Audio API sound system
- ✅ Graphics quality presets (Low / Medium / High / Ultra)
- ✅ Performance optimized with instanced meshes
- ✅ GitHub and Vercel deployment ready

## 📄 Licenses

See [LICENSES.md](./LICENSES.md) for third-party asset attribution.

## ⚡ Performance Notes

- Targets 60 FPS on capable desktops
- Automatically selects quality preset based on device
- Reduce graphics quality in Settings if frame rate drops
- Ultra preset intended for high-end desktop GPUs only
