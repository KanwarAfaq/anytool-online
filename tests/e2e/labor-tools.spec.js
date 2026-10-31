import { test, expect } from '@playwright/test'
for (const slug of ['severance-pay','annual-leave','wage-converter']) {
  test(`new labor tool ${slug} renders results`, async ({ page }) => {
    await page.goto(`/tools/${slug}`)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByText('NT$').first()).toBeVisible()
  })
}
