import fs from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('desktop hero uses selectable Arabic text and individually interactive actions', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1672, height: 941 })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.getByRole('heading', { name: 'أفكار خارج الإطار', exact: true })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'التنقل الرئيسي', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'لنبدأ مشروعك', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'اكتشف أعمالنا', exact: true })).toBeVisible()
  await expect(page.locator('.hero__artwork img')).toHaveAttribute('alt', '')
  await expect.poll(() => page.locator('.hero__artwork img').evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  expect(await page.locator('h1').textContent()).toContain('أفكار')
  expect(await page.locator('html').getAttribute('dir')).toBe('rtl')
  expect(errors).toEqual([])
  if (testInfo.project.name === 'chromium') {
    await fs.mkdir('artifacts', { recursive: true })
    await page.screenshot({ path: 'artifacts/hero-desktop.jpg', type: 'jpeg', quality: 94, fullPage: true })
    console.log('DESKTOP_METRICS', await page.locator('.hero__heading').evaluate((el) => {
      const box = el.getBoundingClientRect()
      return { x: box.x, y: box.y, width: box.width, height: box.height, font: getComputedStyle(el).fontFamily }
    }))
  }
})

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test('hero remains usable without horizontal scrolling at ' + width + 'px', async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
    const title = await page.locator('h1').boundingBox()
    expect(title).not.toBeNull()
    expect(title!.x).toBeGreaterThanOrEqual(0)
    expect(title!.x + title!.width).toBeLessThanOrEqual(width + 1)
    if (width < 980) {
      const artwork = await page.locator('.hero__artwork').boundingBox()
      expect(artwork!.y).toBeGreaterThan(title!.y + title!.height)
    }
    const action = page.getByRole('button', { name: 'لنبدأ مشروعك', exact: true })
    await expect(action).toBeVisible()
    const rect = await action.boundingBox()
    expect(rect!.width).toBeGreaterThanOrEqual(44)
    expect(rect!.height).toBeGreaterThanOrEqual(44)
    if (width === 390 && testInfo.project.name === 'chromium') {
      await fs.mkdir('artifacts', { recursive: true })
      await page.screenshot({ path: 'artifacts/hero-mobile.jpg', type: 'jpeg', quality: 94, fullPage: true })
    }
    if (width === 768 && testInfo.project.name === 'chromium') {
      await fs.mkdir('artifacts', { recursive: true })
      await page.screenshot({ path: 'artifacts/hero-tablet.jpg', type: 'jpeg', quality: 94, fullPage: true })
    }
  })
}

test('mobile navigation supports keyboard dismissal and focus return', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'فتح القائمة', exact: true })
  await trigger.click()
  await expect(page.getByRole('dialog', { name: 'قائمة التنقل' })).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'قائمة التنقل' })).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('primary action prepares a real email draft without claiming delivery', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'لنبدأ مشروعك', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'لنبدأ مشروعك', exact: true })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('الاسم الكامل').fill('عميل كليفيو')
  await dialog.getByLabel('البريد الإلكتروني').fill('hello@example.com')
  await dialog.getByLabel('عن مشروعك').fill('هوية بصرية وموقع جديد')
  await dialog.getByRole('button', { name: 'جهّز رسالة المشروع' }).click()
  const draft = dialog.getByRole('link', { name: 'فتح تطبيق البريد' })
  await expect(draft).toHaveAttribute('href', /^mailto:info%40clevio\.dz\?subject=/)
  expect(decodeURIComponent((await draft.getAttribute('href'))!)).toContain('هوية بصرية وموقع جديد')
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
})

test('secondary action and navigation open useful panels', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'اكتشف أعمالنا', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'أعمالنا', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'إغلاق النافذة' }).click()
  await page.getByRole('button', { name: 'خدماتنا', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'خدماتنا', exact: true })).toBeVisible()
})

test('hero and contact panel pass automated accessibility checks', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const hero = await new AxeBuilder({ page }).analyze()
  expect(hero.violations).toEqual([])
  await page.getByRole('button', { name: 'لنبدأ مشروعك', exact: true }).click()
  const contact = await new AxeBuilder({ page }).analyze()
  expect(contact.violations).toEqual([])
})

test('reduced motion leaves the full headline and actions visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('h1')).toHaveCSS('opacity', '1')
  for (const line of await page.locator('.hero__line').all()) {
    await expect(line).toHaveCSS('opacity', '1')
    await expect(line).toHaveCSS('transform', 'none')
  }
})
