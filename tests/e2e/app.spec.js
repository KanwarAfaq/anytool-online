import { test, expect } from '@playwright/test'
import { tools } from '../../src/data/tools.js'
import { PDFDocument } from 'pdf-lib'

test('home and four languages including RTL', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('One beautiful place')
  const language=page.getByLabel('Language')

  await language.selectOption('zh-TW')
  await expect(page).toHaveURL(/\/zh-tw\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('日常需要的工具')
  await expect(page).toHaveTitle(/2026 台灣薪資稅務計算/)
  await expect(page.locator('html')).toHaveAttribute('dir','ltr')

  await language.selectOption('ar')
  await expect(page).toHaveURL(/\/ar\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('مكان جميل واحد')
  await expect(page.locator('html')).toHaveAttribute('dir','rtl')

  await language.selectOption('ur')
  await expect(page).toHaveURL(/\/ur\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('روزمرہ کے تمام ٹولز')
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
  await expect(page.getByRole('dialog',{name:'Quick launcher'})).toBeVisible()
  await page.getByPlaceholder('Search any calculator, photo, PDF or AI tool').fill('passport')
  await expect(page.getByRole('button',{name:/Taiwan Passport/})).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByPlaceholder('Filter tools by name…').fill('QR Code')
  await expect(page.getByRole('heading',{name:'QR Code Generator'})).toBeVisible()

  await page.goto('/tools/loan-payment')
  await expect(page.getByRole('heading',{name:'Loan Payment Calculator'})).toBeVisible()
  await page.waitForTimeout(100)
  await page.goto('/')
  await expect(page.getByText('Continue where you left off')).toBeVisible()
  await expect(page.getByText('Loan Payment Calculator').first()).toBeVisible()
})
