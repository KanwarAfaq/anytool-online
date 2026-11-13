import puppeteer from 'puppeteer-core'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const artifactDir = 'C:\\Users\\Affu_Home\\.gemini\antigravity\\brain\\3c345c41-c873-4317-8a0e-18e8f90b058a'
const localScreenshotsDir = path.join(rootDir, 'screenshots')

if (!fs.existsSync(localScreenshotsDir)) {
  fs.mkdirSync(localScreenshotsDir, { recursive: true })
}
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true })
}

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]
const executablePath = chromePaths.find(p => fs.existsSync(p))

if (!executablePath) {
  console.error('No suitable Chrome or Edge binary found!')
  process.exit(1)
}

function startStaticServer(port = 4173) {
  const distDir = path.join(rootDir, 'dist')
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.wasm': 'application/wasm',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
  }

  const server = http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0])
    if (!fs.existsSync(filePath)) {
      filePath = path.join(distDir, 'index.html')
    }

    const ext = path.extname(filePath)
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500)
        res.end(`Server Error: ${err.code}`)
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        })
        res.end(content, 'utf-8')
      }
    })
  })

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      console.log(`Static preview server listening on http://127.0.0.1:${port}`)
      resolve(server)
    })
  })
}

async function saveScreenshot(page, filename) {
  const localPath = path.join(localScreenshotsDir, filename)
  const artifactPath = path.join(artifactDir, filename)
  await page.screenshot({ path: localPath })
  fs.copyFileSync(localPath, artifactPath)
  console.log(`✓ Saved screenshot: ${filename}`)
}

async function run() {
  const server = await startStaticServer(4173)

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--window-size=1280,720',
      '--autoplay-policy=no-user-gesture-required',
    ],
    defaultViewport: { width: 1280, height: 720 },
  })

  const page = await browser.newPage()

  const consoleLogs = []
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`)
    if (msg.type() === 'error') {
      console.error(`Browser Error: ${msg.text()}`)
    }
  })
  page.on('pageerror', err => {
    console.error(`Page Crash/Error:`, err)
  })

  try {
    console.log('Navigating to http://127.0.0.1:4173 ...')
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle0', timeout: 20000 })
    await new Promise(r => setTimeout(r, 2500))

    // 1. Main menu
    console.log('Capturing: 1_main_menu.png')
    await saveScreenshot(page, '1_main_menu.png')

    // 2. Start game -> Player in forest
    console.log('Starting game and capturing player in forest...')
    await page.evaluate(() => {
      const store = window.__GAME_STORE__
      if (store) {
        store.getState().startGame()
        store.getState().setPlayerPosition([-35, 6, 5])
        store.getState().setRegion('forest')
      }
    })
    await new Promise(r => setTimeout(r, 4000))
    await saveScreenshot(page, '2_player_forest.png')

    // 3. Move to Crystal Valley
    console.log('Moving player to Crystal Valley...')
    await page.evaluate(() => {
      const store = window.__GAME_STORE__
      if (store) {
        store.getState().setPlayerPosition([22, 5, 8])
        store.getState().setRegion('crystal')
      }
    })
    await new Promise(r => setTimeout(r, 3500))
    await saveScreenshot(page, '3_crystal_valley.png')

    // 4. Move to Ancient Sanctuary
    console.log('Moving player to Ancient Sanctuary...')
    await page.evaluate(() => {
      const store = window.__GAME_STORE__
      if (store) {
        store.getState().setPlayerPosition([70, 16.5, 18])
        store.getState().setRegion('sanctuary')
      }
    })
    await new Promise(r => setTimeout(r, 3500))
    await saveScreenshot(page, '4_ancient_sanctuary.png')

    // 5. Combat
    console.log('Setting up combat...')
    await page.evaluate(() => {
      const store = window.__GAME_STORE__
      if (store) {
        store.getState().setInCombat(true)
        store.getState().setPlayerAttacking(true)
        store.getState().takeDamage(15)
      }
    })
    await new Promise(r => setTimeout(r, 1500))
    await saveScreenshot(page, '5_combat.png')

    // 6. Final portal
    console.log('Activating and viewing final portal...')
    await page.evaluate(() => {
      const store = window.__GAME_STORE__
      if (store) {
        store.getState().setPlayerPosition([72, 16.5, 18])
        for (let i = 0; i < 9; i++) {
          store.getState().collectCrystal(`crystal_${i}`)
        }
        store.setState({ portalActivated: true })
      }
    })
    await new Promise(r => setTimeout(r, 3000))
    await saveScreenshot(page, '6_final_portal.png')

    // 7. Victory screen
    console.log('Showing victory screen...')
    await page.evaluate(() => {
      const store = window.__GAME_STORE__
      if (store) {
        store.getState().completeLevel()
      }
    })
    await new Promise(r => setTimeout(r, 2000))
    await saveScreenshot(page, '7_victory_screen.png')

    console.log('\n--- BROWSER CONSOLE AUDIT LOG ---')
    const errors = consoleLogs.filter(l => l.includes('[error]'))
    console.log(`Total console errors: ${errors.length}`)
    errors.forEach(e => console.log(e))

    console.log('\nAll 7 upgraded audit screenshots successfully captured!')
  } catch (err) {
    console.error('Audit execution error:', err)
  } finally {
    await browser.close()
    server.close()
  }
}

run()
