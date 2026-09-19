import { test, expect } from '@playwright/test'
import { tools } from '../../src/data/tools.js'
import { PDFDocument } from 'pdf-lib'

test('home and four languages including RTL', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Useful tools')
  const language=page.getByLabel('Language')

  await language.selectOption('zh-TW')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('實用工具')
  await expect(page.locator('html')).toHaveAttribute('dir','ltr')

  await language.selectOption('ar')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('أدوات مفيدة')
  await expect(page.locator('html')).toHaveAttribute('dir','rtl')

  await language.selectOption('ur')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('کارآمد ٹولز')
  await expect(page.locator('html')).toHaveAttribute('dir','rtl')

  await language.selectOption('en')
  await expect(page.locator('html')).toHaveAttribute('lang','en')
})

test('all public tool routes render and have canonical URLs', async ({ page }) => {
  for (const tool of tools) {
    await page.goto('/tools/'+tool.slug)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(tool.name)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://anytool.online/tools/'+tool.slug)
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
  await page.locator('input.input').fill('https://anytool.online/test')
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

test('auth dashboard upload AI and SEO surfaces render', async ({ page, request }) => {
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
  expect(body).toContain('https://anytool.online/tools/take-home-pay')
  expect(body).toContain('https://anytool.online/tools/receipt-to-json')
})
