import { test, expect } from '@playwright/test'
import { tools } from '../../src/data/tools.js'
import { PDFDocument } from 'pdf-lib'
import QRCode from 'qrcode'

test('home and four languages including RTL', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Calculate. Convert.')
  const language=page.getByLabel('Language')

  await language.selectOption('zh-TW')
  await expect(page).toHaveURL(/\/zh-tw\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('計算、轉換、')
  await expect(page).toHaveTitle(/2026 台灣薪資稅務計算/)
  await expect(page.locator('html')).toHaveAttribute('dir','ltr')

  await language.selectOption('ar')
  await expect(page).toHaveURL(/\/ar\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('احسب. حوّل.')
  await expect(page.locator('html')).toHaveAttribute('dir','rtl')

  await language.selectOption('ur')
  await expect(page).toHaveURL(/\/ur\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('حساب کریں۔ تبدیل کریں۔')
  await expect(page.locator('html')).toHaveAttribute('dir','rtl')

  await language.selectOption('en')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang','en')
})

test('all public tool routes render and have canonical URLs', async ({ page }) => {
  for (const tool of tools) {
    await page.goto('/tools/'+tool.slug)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(tool.name)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://www.anytool.online/tools/'+tool.slug)
  }
})

test('salary percentage tax minimum wage and loan calculators respond', async ({ page }) => {
  await page.goto('/tools/take-home-pay')
  const salary=page.getByLabel('Monthly salary (NT$)')
  await salary.fill('60000')
  await expect(page.getByText('Estimated net')).toBeVisible()
  await expect(page.locator('text=/NT\\$ [0-9,]+/').first()).toBeVisible()

  await page.goto('/tools/percentage')
  await page.getByLabel('Original').fill('100')
  await page.getByLabel('New value').fill('125')
  await expect(page.getByText('25.00%')).toBeVisible()

  await page.goto('/tools/income-tax')
  await page.getByLabel('Annual salary income (NT$)').fill('720000')
  await expect(page.getByText('Estimated annual tax')).toBeVisible()

  await page.goto('/tools/minimum-wage')
  await page.getByLabel('Hourly wage (NT$)').fill('196')
  await expect(page.getByText('Hourly wage status')).toBeVisible()

  await page.goto('/tools/loan-payment')
  await page.getByLabel('Loan amount').fill('1000000')
  await page.getByLabel('Annual interest rate (%)').fill('2.5')
  await page.getByLabel('Loan term (months)').fill('60')
  await expect(page.getByText('Monthly payment')).toBeVisible()
})

test('QR generation works', async ({ page }) => {
  await page.goto('/tools/qr-generator')
  await page.getByRole('textbox').fill('https://www.anytool.online/test')
  await page.getByRole('button',{name:'Generate'}).click()
  await expect(page.locator('img[alt="QR code"]')).toBeVisible()
  await expect(page.getByRole('link',{name:'Download'})).toHaveAttribute('download','qr.png')
})

test('image resize creates a downloadable result', async ({ page }) => {
  await page.goto('/tools/image-resize')
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl8V1kAAAAASUVORK5CYII=','base64')
  await page.locator('input[type=file]').setInputFiles({name:'one.png',mimeType:'image/png',buffer:png})
  await expect(page.getByRole('link',{name:'Download result'})).toBeVisible()
})

test('PDF merge and split trigger downloads', async ({ page }) => {
  const doc=await PDFDocument.create()
  doc.addPage([200,200])
  doc.addPage([200,200])
  const bytes=Buffer.from(await doc.save())

  await page.goto('/tools/pdf-merge')
  const mergeDownload=page.waitForEvent('download')
  await page.locator('input[type=file]').setInputFiles([
    {name:'a.pdf',mimeType:'application/pdf',buffer:bytes},
    {name:'b.pdf',mimeType:'application/pdf',buffer:bytes},
  ])
  expect((await mergeDownload).suggestedFilename()).toBe('merged.pdf')

  await page.goto('/tools/pdf-split')
  await page.getByLabel('First page').fill('1')
  await page.getByLabel('Last page').fill('2')
  const splitDownload=page.waitForEvent('download')
  await page.locator('input[type=file]').setInputFiles({name:'two.pdf',mimeType:'application/pdf',buffer:bytes})
  expect((await splitDownload).suggestedFilename()).toBe('pages-1-2.pdf')
})

test('auth dashboard AI and SEO surfaces render', async ({ page, request }) => {
  await page.goto('/auth')
  await expect(page.getByPlaceholder('Email')).toBeVisible()
  await expect(page.getByPlaceholder('Password')).toBeVisible()

  await page.goto('/dashboard')
  await expect(page.getByText('Your dashboard')).toBeVisible()

  await page.goto('/tools/ocr')
  await expect(page.locator('input[type=file]')).toBeVisible()

  const sitemap=await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBeTruthy()
  const body=await sitemap.text()
  expect(body).toContain('https://www.anytool.online/tools/take-home-pay')
  expect(body).toContain('https://www.anytool.online/tools/receipt-to-json')
})


test('zero-default numeric fields replace rather than prefix zero', async ({ page }) => {
  await page.goto('/tools/income-tax')
  const spouse=page.getByLabel('Spouse annual salary (NT$)')
  await expect(spouse).toHaveValue('')
  await spouse.fill('50000')
  await expect(spouse).toHaveValue('50000')
  await spouse.fill('0')
  await expect(spouse).toHaveValue('')
})

test('passport ARC photo maker exposes practical crop controls', async ({ page }) => {
  await page.goto('/tools/taiwan-id-photo')
  await expect(page.getByLabel('Document preset')).toBeVisible()
  await expect(page.getByLabel('Width (mm)')).toHaveValue('35')
  await expect(page.getByLabel('Height (mm)')).toHaveValue('45')
  await expect(page.getByLabel('DPI')).toHaveValue('300')
  await expect(page.getByRole('link',{name:'Official guide'})).toBeVisible()
  const controls=page.locator('input,select')
  expect(await controls.count()).toBeGreaterThanOrEqual(8)
})

test('elder care tool shows source-backed subsidy and official city systems', async ({ page }) => {
  await page.goto('/tools/taiwan-elder-care')
  await expect(page.getByText('Up to NT$15,000 / month')).toBeVisible()
  await expect(page.getByText('Up to NT$180,000 / year')).toBeVisible()
  await expect(page.getByText('Other official city / national systems')).toBeVisible()
  await expect(page.getByText('Central subsidy estimator')).toBeVisible()
  await expect(page.getByText('NT$180,000',{exact:true})).toBeVisible()
  await page.getByLabel('Long-term care need level').selectOption('3')
  await page.getByLabel('Moderate-or-higher disability certificate').check()
  await expect(page.getByText('NT$180,000',{exact:true})).toBeVisible()
})

test('public trust pages and auth recovery surfaces render', async ({ page }) => {
  for (const path of ['/about','/contact','/privacy','/methodology','/sources']) {
    await page.goto(path)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/index,follow/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new RegExp('https://www\\.anytool\\.online'))
  }
  await page.goto('/auth')
  await page.getByRole('button',{name:'Email OTP'}).click()
  await expect(page.getByRole('heading',{name:'Email OTP'})).toBeVisible()
  await page.getByRole('button',{name:'Back to sign in'}).click()
  await page.getByRole('button',{name:'Forgot password?'}).click()
  await expect(page.getByRole('heading',{name:'Reset password'})).toBeVisible()

  await page.goto('/profile')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow')
})

test('localized tool pages publish hreflang alternates', async ({ page }) => {
  await page.goto('/zh-tw/tools/take-home-pay')
  await expect(page.locator('html')).toHaveAttribute('lang','zh-TW')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://www.anytool.online/zh-tw/tools/take-home-pay')
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute('href','https://www.anytool.online/ar/tools/take-home-pay')
})


test('modern quick calculator command palette filters and recent tools work', async ({ page }) => {
  await page.goto('/')
  const quickSalary=page.getByLabel('Monthly salary (NT$)').first()
  await quickSalary.fill('65000')
  await expect(page.getByText('Estimated take-home')).toBeVisible()

  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog',{name:'Search tools'})).toBeVisible()
  await page.getByRole('dialog',{name:'Search tools'}).getByRole('textbox').fill('passport')
  await expect(page.getByRole('option',{name:/Taiwan Passport/})).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByPlaceholder('Search tools…').fill('QR Code')
  await expect(page.getByRole('heading',{name:'QR Code Generator'})).toBeVisible()

  await page.goto('/tools/loan-payment')
  await expect(page.getByRole('heading',{name:'Loan Payment Calculator'})).toBeVisible()
  await page.waitForTimeout(100)
  await page.goto('/')
  await expect(page.getByText('Recent')).toBeVisible()
  await expect(page.getByText('Loan Payment Calculator').first()).toBeVisible()
})


test('all-tools directory keeps every tool visible and reachable', async ({ page }) => {
  await page.goto('/tools')
  for (const tool of tools) {
    const link=page.locator('a[href="/tools/'+tool.slug+'"]').first()
    await expect(link).toBeVisible()
    await expect(link).toContainText(tool.name)
    await expect(link.locator('img[src="/tool-art/'+tool.slug+'.svg"]')).toHaveAttribute('alt',/visual preview/)
  }

  await page.goto('/')
  const cards=page.locator('#tools a[href^="/tools/"]')
  await expect(cards).toHaveCount(tools.length)
  for (const tool of tools) {
    const card=page.locator('#tools a[href="/tools/'+tool.slug+'"]')
    await expect(card).toBeVisible()
    await expect(card.locator('img[src="/tool-art/'+tool.slug+'.svg"]')).toHaveAttribute('alt',/visual preview/)
  }
})

test('numeric inputs can be cleared and retyped without leading zero', async ({ page }) => {
  await page.goto('/tools/take-home-pay')
  const salary=page.getByLabel('Monthly salary (NT$)')
  await salary.fill('')
  await expect(salary).toHaveValue('')
  await salary.type('50000')
  await expect(salary).toHaveValue('50000')
})

test('tool pages expose a representative visual and image metadata', async ({ page }) => {await page.goto('/tools/taiwan-id-photo');await expect(page.locator('img[src="/tool-art/taiwan-id-photo.svg"]')).toBeVisible();await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://www.anytool.online/tool-art/taiwan-id-photo.svg')})


test('key public controls expose accessible names', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByLabel('Account')).toBeVisible()

  await page.goto('/tools/qr-generator')
  await expect(page.getByLabel('Text or URL')).toBeVisible()

  await page.goto('/tools/qr-scanner')
  await expect(page.getByLabel('Choose QR code image')).toBeVisible()

  await page.goto('/tools/pdf-merge')
  await expect(page.getByLabel('Choose PDF files')).toBeVisible()

  await page.goto('/tools/ocr')
  await expect(page.getByLabel('Choose image or PDF file')).toBeVisible()

  await page.goto('/tools/taiwan-id-photo')
  await expect(page.getByLabel('Choose portrait photo')).toBeVisible()

  await page.goto('/tools/taiwan-elder-care')
  await expect(page.getByLabel('Official bed dataset')).toBeVisible()
  await expect(page.getByLabel('Search facility, district or address')).toBeVisible()
})

test('image compression honors PNG output and conversion inputs are constrained', async ({ page }) => {
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl8V1kAAAAASUVORK5CYII=','base64')

  await page.goto('/tools/image-compress')
  await page.getByLabel('Output format').selectOption('image/png')
  await page.getByLabel('Choose image file').setInputFiles({name:'one.png',mimeType:'image/png',buffer:png})
  const download=page.getByRole('link',{name:'Download result'})
  await expect(download).toBeVisible()
  const mime=await download.evaluate(async a=>(await (await fetch(a.href)).blob()).type)
  expect(mime).toBe('image/png')

  await page.goto('/tools/png-to-jpg')
  await expect(page.getByLabel('Choose image file')).toHaveAttribute('accept','image/png')
  await page.goto('/tools/jpg-to-png')
  await expect(page.getByLabel('Choose image file')).toHaveAttribute('accept','image/jpeg')
})

test('command palette supports keyboard selection', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Control+k')
  const dialog=page.getByRole('dialog',{name:'Search tools'})
  await dialog.getByRole('textbox').fill('passport')
  await expect(dialog.getByRole('option')).toHaveCount(1)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/tools\/taiwan-id-photo$/)
})


test('homepage search query parameter drives the visible catalog', async ({ page }) => {
  await page.goto('/?q=passport')
  await expect(page.getByPlaceholder('Search tools…')).toHaveValue('passport')
  await expect(page.getByRole('heading',{name:'Taiwan Passport / ARC Photo Maker'})).toBeVisible()
  await expect(page.locator('#tools a[href="/tools/take-home-pay"]')).toHaveCount(0)
})


test('QR scanner decodes an uploaded QR image', async ({ page }) => {
  const value='https://www.anytool.online/tools/qr-scanner'
  const dataUrl=await QRCode.toDataURL(value,{width:320,margin:4,errorCorrectionLevel:'M'})
  const png=Buffer.from(dataUrl.split(',')[1],'base64')
  await page.goto('/tools/qr-scanner')
  await page.getByLabel('Choose QR code image').setInputFiles({name:'qr.png',mimeType:'image/png',buffer:png})
  await expect(page.getByText(value,{exact:true})).toBeVisible()
})


test('ordinary public pages keep WebPage structured data after hydration', async ({ page }) => {
  for (const path of ['/about','/privacy','/contact','/methodology','/sources']) {
    await page.goto(path)
    await expect(page.locator('script[data-anytool-jsonld]')).toHaveCount(1)
    const schemas=await page.locator('script[data-anytool-jsonld]').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.textContent)))
    expect(schemas.some(s=>s['@type']==='WebPage'&&s.url==='https://www.anytool.online'+path)).toBeTruthy()
  }
  await page.goto('/zh-tw/about')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://www.anytool.online/zh-tw/about')
})

test('home publishes a Google-compatible PNG favicon', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('link[rel="icon"][type="image/png"]')).toHaveAttribute('href','/favicon-192.png')
})


test('remaining calculator functions pass representative dummy inputs', async ({ page }) => {
  await page.goto('/tools/labor-insurance')
  await page.getByLabel('Monthly salary (NT$)').fill('36300')
  await expect(page.getByText('835',{exact:true})).toBeVisible()

  await page.goto('/tools/nhi')
  await page.getByLabel('Monthly salary (NT$)').fill('29500')
  await page.getByLabel('NHI dependents').fill('1')
  await expect(page.getByText('916',{exact:true})).toBeVisible()

  await page.goto('/tools/overtime-pay')
  await page.getByLabel('Monthly salary (NT$)').fill('50000')
  await page.getByLabel('Weekday overtime hours').fill('2')
  await expect(page.getByText('Estimated overtime pay')).toBeVisible()

  await page.goto('/tools/employer-cost')
  await page.getByLabel('Monthly salary (NT$)').fill('36300')
  await expect(page.getByText('Estimated monthly employer cost')).toBeVisible()

  await page.goto('/tools/annual-salary')
  await page.getByLabel('Monthly salary (NT$)').fill('50000')
  await page.getByLabel('Paid salary months').fill('13')
  await expect(page.getByText('650,000',{exact:false})).toBeVisible()
  await page.getByRole('button',{name:'Annual → monthly'}).click()
  await page.getByLabel('Annual package').fill('650000')
  await expect(page.getByText('50,000',{exact:false})).toBeVisible()

  await page.goto('/tools/dpi-calculator')
  await page.getByLabel('Pixels').fill('3000')
  await page.getByLabel('Print width (inches)').fill('10')
  await expect(page.getByText('300.0',{exact:true})).toBeVisible()
})

test('format conversion tools emit the requested MIME types', async ({ page }) => {
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl8V1kAAAAASUVORK5CYII=','base64')
  await page.goto('/tools/png-to-jpg')
  await page.getByLabel('Choose image file').setInputFiles({name:'one.png',mimeType:'image/png',buffer:png})
  let dl=page.getByRole('link',{name:'Download result'})
  await expect(dl).toBeVisible()
  expect(await dl.evaluate(async a=>(await (await fetch(a.href)).blob()).type)).toBe('image/jpeg')

  await page.goto('/tools/jpg-to-png')
  const jpg=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAEf/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAABAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPxB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPxB//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxB//9k=','base64')
  await page.getByLabel('Choose image file').setInputFiles({name:'one.jpg',mimeType:'image/jpeg',buffer:jpg})
  dl=page.getByRole('link',{name:'Download result'})
  await expect(dl).toBeVisible()
  expect(await dl.evaluate(async a=>(await (await fetch(a.href)).blob()).type)).toBe('image/png')
})

test('new picker wheel accepts editable entries and produces a selection', async ({ page }) => {
  await page.goto('/tools/random-picker')
  const entries=page.getByLabel('Wheel entries')
  await entries.fill('Alice\nBob\n42')
  await page.getByLabel('Add wheel item').fill('Nina')
  await page.getByRole('button',{name:'Add'}).click()
  await expect(entries).toContainText('')
  await page.getByRole('button',{name:'Spin wheel'}).click()
  await expect(page.getByText('Selected')).toBeVisible({timeout:3000})
  await expect(page.locator('.picker-winner strong')).not.toHaveText('Add at least two entries and spin')
})

test('new timer supports presets start pause and selectable sounds', async ({ page }) => {
  await page.goto('/tools/timer')
  await page.getByLabel('Timer minutes').fill('0')
  await page.getByLabel('Timer seconds').fill('5')
  await page.getByLabel('Timer sound').selectOption('soft')
  await expect(page.getByText('00:05',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Start'}).click()
  await expect(page.getByRole('button',{name:'Pause'})).toBeVisible()
  await page.getByRole('button',{name:'Pause'}).click()
  await expect(page.getByRole('button',{name:'Start'})).toBeVisible()
  await page.getByRole('button',{name:'Reset'}).click()
})

test('new image sketch tool creates a local downloadable PNG', async ({ page }) => {
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl8V1kAAAAASUVORK5CYII=','base64')
  await page.goto('/tools/image-to-sketch')
  await page.getByLabel('Choose photo for sketch').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:png})
  await expect(page.locator('canvas[aria-label="Sketch preview"]')).toBeVisible()
  await expect(page.getByRole('button',{name:'Download PNG sketch'})).toBeVisible()
  await page.getByLabel('Sketch line strength').fill('2')
  const dims=await page.locator('canvas[aria-label="Sketch preview"]').evaluate(c=>[c.width,c.height])
  expect(dims[0]).toBeGreaterThan(0);expect(dims[1]).toBeGreaterThan(0)
})

test('tool directory is large searchable and exposes all 26 tools', async ({ page }) => {
  await page.goto('/tools')
  await expect(page.getByLabel('Search all tools')).toBeVisible()
  await expect(page.locator('.directory-tool-button')).toHaveCount(26)
  await page.getByLabel('Search all tools').fill('timer')
  await expect(page.locator('.directory-tool-button')).toHaveCount(1)
  await expect(page.getByRole('link',{name:/Timer with Sounds/})).toBeVisible()
})
