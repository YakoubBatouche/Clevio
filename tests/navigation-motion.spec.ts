import { expect, test } from '@playwright/test'

test('reload returns to the hero while fresh section links remain usable', async ({ page }) => {
  await page.goto('/?skipintro&preview=reload#work')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('#work-heading')).toBeInViewport({ ratio: 1 })
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200)
  await page.reload()
  await expect(page).toHaveURL(/\?skipintro&preview=reload#home$/)
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2)
  await expect(page.locator('h1')).toBeInViewport({ ratio: 1 })
  await page.goto('/?skipintro#contact')
  await expect(page.locator('#contact-heading')).toBeInViewport({ ratio: 1 })
  await page.getByRole('navigation', { name: 'التنقل الرئيسي', exact: true }).getByRole('link', { name: 'خدماتنا', exact: true }).click()
  await expect(page.locator('#services-heading')).toBeInViewport({ ratio: 1 })
})

test('a small mobile scroll reveals incoming content instead of leaving it blank', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?skipintro#home')
  await page.evaluate(() => document.fonts.ready)
  const incoming = page.locator('#services')
  await expect(incoming.locator('.service-card').first()).toHaveCSS('opacity', '0')
  await page.evaluate(() => window.scrollTo({ top: 24, behavior: 'instant' }))
  await expect(incoming).toHaveAttribute('data-section-revealed', 'true')
  await expect(incoming.locator('.service-card').first()).toHaveCSS('opacity', '1')
  await expect(incoming.locator('.service-card').first()).toHaveCSS('transform', 'none')
})

test.describe('native phone swipes', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'no-preference' })
  test('a short vertical swipe settles exactly one section and horizontal drags stay native', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Native touch input uses Chromium device emulation; reveal behavior is checked in every browser.')
    await page.goto('/?skipintro#home')
    await page.evaluate(() => document.fonts.ready)
    const session = await page.context().newCDPSession(page)
    async function swipe(dx: number, dy: number) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 700, id: 1 }] })
      for (const amount of [0.28, 0.55, 1]) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180 + dx * amount, y: 700 + dy * amount, id: 1 }] })
        await page.waitForTimeout(30)
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }
    async function landing(id: string) {
      const target = await page.locator(id).evaluate((element) => element.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-offset')))
      await expect.poll(() => page.evaluate(() => scrollY), { timeout: 6000 }).toBeGreaterThan(target - 3)
      await expect.poll(() => page.evaluate(() => scrollY), { timeout: 6000 }).toBeLessThan(target + 3)
    }
    await swipe(36, -3)
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(3)
    await swipe(0, -26)
    await landing('#services')
    await expect(page.locator('#services .service-card').first()).toHaveCSS('opacity', '1')
    await swipe(0, -26)
    await landing('#partners')
    await expect(page.locator('#partners .work-showcase__card').first()).toHaveCSS('opacity', '1')
    await swipe(0, 26)
    await landing('#services')
    await expect(page.locator('dialog[open]')).toHaveCount(0)
    await session.detach()
  })
})
