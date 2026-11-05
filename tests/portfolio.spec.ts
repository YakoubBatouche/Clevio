import { expect, test, type Locator } from '@playwright/test'

const category = 'الهوية والعلامة التجارية'

test('portfolio lays out three desktop columns, filters the gallery, and returns focus', async ({ page }) => {
  await page.goto('/?skipintro#work')
  const trigger = page.getByRole('button', { name: category, exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const sheet = page.getByRole('dialog', { name: category, exact: true })
  await expect(sheet).toBeVisible()
  const all = sheet.getByRole('button', { name: 'الكل', exact: true })
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  const images = sheet.locator('.portfolio-sheet__media img')
  await expect(images).toHaveCount(3)
  const row = await images.evaluateAll(items => items.map(item => {
    const { left, top, width } = item.getBoundingClientRect()
    return { left, top, width }
  }))
  expect(new Set(row.map(item => item.left)).size).toBe(3)
  for (const item of row.slice(1)) {
    expect(Math.abs(item.top - row[0].top)).toBeLessThan(1)
    expect(Math.abs(item.width - row[0].width)).toBeLessThan(1)
  }

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  for (const [label, source] of [
    ['شعارات', /\/work\/brand-identity\.webp$/],
    ['ملصقات', /\/work\/brand-poster\.svg$/],
    ['صور مصغّرة', /\/work\/brand-thumbnail\.svg$/],
  ] as const) {
    const filter = sheet.getByRole('button', { name: label, exact: true })
    await filter.click()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(all).toHaveAttribute('aria-pressed', 'false')
    await expect(images).toHaveCount(1)
    await expect(images).toHaveAttribute('src', source)
  }
  await all.click()
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  await expect(images).toHaveCount(3)
  await sheet.getByRole('button', { name: 'ملصقات', exact: true }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page).toHaveURL(/#work$/)

  await trigger.click()
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  await expect(images).toHaveCount(3)
  await sheet.getByRole('button', { name: 'إغلاق معرض الأعمال', exact: true }).click()
  await expect(sheet).toBeHidden()
  await page.locator('#work').getByRole('button', { name: 'التصميم الإبداعي', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'التصميم الإبداعي', exact: true })).toBeVisible()
})

test.describe('mobile portfolio', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('gallery scrolls within the sheet and keeps the work stage locked', async ({ page }) => {
    await page.goto('/?skipintro#work')
    const trigger = page.getByRole('button', { name: category, exact: true })
    await expect(page.locator('html')).toHaveClass(/section-paging-mobile/)
    await expect(trigger).toBeInViewport({ ratio: 0.99 })
    const pageScroll = await page.evaluate(() => scrollY)
    await trigger.tap()
    const sheet = page.getByRole('dialog', { name: category, exact: true })
    await expect(sheet).toBeVisible()
    const scroller = sheet.locator('.portfolio-sheet__scroll')
    const tiles = scroller.locator('.portfolio-sheet__media')
    const first = await tiles.first().boundingBox()
    const second = await tiles.nth(1).boundingBox()
    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    expect(Math.abs(first!.width / first!.height - 1378 / 996)).toBeLessThan(0.02)
    expect(Math.abs(first!.width - second!.width)).toBeLessThan(1)
    expect(second!.y).toBeGreaterThan(first!.y + first!.height)
    const scrollerBounds = await scroller.boundingBox()
    await page.mouse.move(scrollerBounds!.x + scrollerBounds!.width / 2, scrollerBounds!.y + 90)
    await page.mouse.wheel(0, 240)
    await expect.poll(() => scroller.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
    await expect(sheet.getByRole('button', { name: 'الكل', exact: true })).toBeInViewport()
    expect(Math.abs(await page.evaluate(() => scrollY) - pageScroll)).toBeLessThan(2)
    await sheet.getByRole('button', { name: 'إغلاق معرض الأعمال', exact: true }).tap()
    await expect(sheet).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('handle swipes move the sheet while gallery swipes scroll within it', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Native swipe input uses Chromium device emulation.')
    await page.goto('/?skipintro#work')
    const trigger = page.getByRole('button', { name: category, exact: true })
    await trigger.tap()
    const sheet = page.getByRole('dialog', { name: category, exact: true })
    const handle = sheet.getByRole('button', { name: 'اسحب لإغلاق معرض الأعمال', exact: true })
    const scroller = sheet.locator('.portfolio-sheet__scroll')
    await expect(sheet).toBeVisible()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await expect.poll(() => sheet.evaluate(element => Math.abs(element.getBoundingClientRect().bottom - innerHeight))).toBeLessThan(1)
    const handleTop = () => handle.evaluate(element => element.getBoundingClientRect().top)
    const restTop = await handleTop()
    const pageScroll = await page.evaluate(() => scrollY)
    const touch = await page.context().newCDPSession(page)

    async function swipe(target: Locator, distance: number, whileHeld?: () => Promise<void>) {
      const box = await target.boundingBox()
      if (!box) throw new Error('Swipe target has no visible bounds')
      const x = box.x + box.width / 2
      const y = box.y + box.height / 2
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
      for (const fraction of [0.3, 0.6, 1]) {
        await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + distance * fraction, id: 1 }] })
      }
      await whileHeld?.()
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }

    await swipe(scroller, 170, async () => {
      expect(Math.abs(await handleTop() - restTop)).toBeLessThan(1)
    })
    await expect(sheet).toBeVisible()
    await swipe(scroller, -170)
    await expect.poll(() => scroller.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
    expect(Math.abs(await handleTop() - restTop)).toBeLessThan(1)

    await swipe(handle, 40, async () => {
      await expect.poll(handleTop).toBeGreaterThan(restTop + 25)
    })
    await expect.poll(async () => Math.abs(await handleTop() - restTop)).toBeLessThan(1)
    await expect(sheet).toBeVisible()
    expect(Math.abs(await page.evaluate(() => scrollY) - pageScroll)).toBeLessThan(2)

    await swipe(handle, 170)
    await expect(sheet).toBeHidden()
    await expect(trigger).toBeFocused()
    await expect(page).toHaveURL(/#work$/)
    await touch.detach()
  })
})
