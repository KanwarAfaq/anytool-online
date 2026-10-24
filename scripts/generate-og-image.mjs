// Renders public/og-default.png (1200x630) for Open Graph / Twitter cards.
// Run manually after changing the brand: `node scripts/generate-og-image.mjs` (needs a local Chromium via playwright-core).
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
const html=`<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;background:#0b0d13;color:#f1f3f9;display:flex;flex-direction:column;justify-content:center;padding:0 88px;position:relative;overflow:hidden}
.glow{position:absolute;right:-160px;top:-180px;width:720px;height:720px;border-radius:50%;background:radial-gradient(circle,#4f46e5 0,rgba(79,70,229,0) 68%);opacity:.55}
.brand{display:flex;align-items:center;gap:18px;font-size:34px;font-weight:800;letter-spacing:-.02em}.mark{width:60px;height:60px;border-radius:16px;background:#4f46e5;display:grid;place-items:center;font-size:34px}
h1{margin-top:44px;font-size:78px;line-height:1.04;font-weight:850;letter-spacing:-.04em;max-width:900px}h1 span{background:linear-gradient(100deg,#a5b4fc,#22d3ee);-webkit-background-clip:text;color:transparent}
p{margin-top:28px;font-size:30px;color:#b8c0d4;max-width:840px;line-height:1.4}.chips{position:absolute;left:88px;bottom:52px;display:flex;gap:14px}.chips b{border:1px solid #2e3550;background:#141822;border-radius:99px;padding:10px 20px;font-size:22px;font-weight:650;color:#c6ccdb}
</style><div class="glow"></div><div class="brand"><div class="mark">⚙</div>AnyTool.online</div><h1>Every tool you need. <span>In one place.</span></h1><p>Free calculators, PDF, image, QR and AI tools.</p><div class="chips"><b>62 tools</b><b>Browser-first</b><b>EN · 繁中 · العربية · اردو</b></div>`
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/opt/pw-browsers/chromium',args:['--no-sandbox']})
const p=await b.newPage({viewport:{width:1200,height:630}})
await p.setContent(html);await p.waitForTimeout(300)
await mkdir('public',{recursive:true})
await p.screenshot({path:'public/og-default.png'})
await b.close()
console.log('wrote public/og-default.png')
