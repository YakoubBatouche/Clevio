import { setTimeout as pause } from 'node:timers/promises'
import { expect, test, type CDPSession, type Locator } from '@playwright/test'

const category = 'المطبوعات والهوية البصرية'
const webCategory = 'المواقع والتطبيقات'
const brandingFilter = 'تصميم العلامة التجارية'
const editorialFilter = 'المطبوعات التحريرية والكتالوجات'
const packagingFilter = 'التغليف والملصقات التعريفية'
const marketingFilter = 'المواد التسويقية'

const categories = [
  {
    title: category,
    description: 'تصميم المواد المطبوعة والمادية',
    filters: [brandingFilter, editorialFilter, packagingFilter, 'اللافتات والطباعة كبيرة الحجم', marketingFilter],
  },
  {
    title: webCategory,
    description: 'التصميم التقني، وتصميم الواجهات وتجربة المستخدم، والبرمجة',
    filters: ['المواقع التعريفية ومواقع المؤسسات', 'التجارة الإلكترونية وتجارة التجزئة', 'تطبيقات الهواتف الذكية', 'تطبيقات الويب وأدوات العمل', 'صفحات الهبوط وتصميم الواجهات وتجربة المستخدم'],
  },
  {
    title: 'التسويق الرقمي والنمو',
    description: 'الاستراتيجية واستقطاب العملاء',
    filters: ['الاستراتيجية ووسائل التواصل الاجتماعي', 'الحملات الإعلانية', 'تحسين الظهور في محركات البحث', 'التسويق عبر البريد الإلكتروني وواتساب'],
  },
  {
    title: 'الإنتاج السمعي البصري والإعلام',
    description: 'السرد القصصي وما بعد الإنتاج',
    filters: ['كتابة السيناريو واللوحات القصصية', 'التصميم الحركي والرسوم المتحركة', 'المونتاج وما بعد الإنتاج', 'الإخراج الفني لجلسات التصوير'],
  },
]

test('the four portfolio categories expose their Arabic filters and service scope', async ({ page }) => {
  await page.goto('/?skipintro#work')
  const work = page.locator('#work')
  await expect(work.locator('.work-showcase__card h3')).toHaveText(categories.map(entry => entry.title))
  for (const entry of categories) {
    await work.getByRole('button', { name: entry.title, exact: true }).click()
    const sheet = page.getByRole('dialog', { name: entry.title, exact: true })
    await expect(sheet).toBeVisible()
    await expect(sheet.getByText(entry.description, { exact: false })).toBeVisible()
    await expect(sheet.locator('.portfolio-sheet__filter')).toHaveText(['الكل', ...entry.filters])
    if (entry.title === category) {
      await sheet.getByRole('button', { name: editorialFilter, exact: true }).click()
      await expect(sheet.getByText('تصميم الكتيبات والمجلات والتقارير وقوائم الطعام.', { exact: true })).toBeVisible()
      await expect(sheet.locator('.portfolio-sheet__empty')).toBeVisible()
      await expect(sheet.locator('.portfolio-sheet__media')).toHaveCount(0)
    }
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  }
})

test('portfolio opens with five desktop columns, filters the gallery, and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/?skipintro#work')
  const trigger = page.getByRole('button', { name: category, exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const sheet = page.getByRole('dialog', { name: category, exact: true })
  await expect(sheet).toBeVisible()
  const filterStrip = sheet.getByRole('group', { name: 'تصفية الأعمال', exact: true })
  const all = filterStrip.getByRole('button', { name: 'الكل', exact: true })
  const [heading, title, close, filters, firstPill, lastPill] = await Promise.all([
    sheet.locator('.portfolio-sheet__heading').boundingBox(),
    sheet.getByRole('heading', { name: category, exact: true }).boundingBox(),
    sheet.getByRole('button', { name: 'إغلاق معرض الأعمال', exact: true }).boundingBox(),
    filterStrip.boundingBox(),
    all.boundingBox(),
    filterStrip.getByRole('button', { name: marketingFilter, exact: true }).boundingBox(),
  ])
  expect(filters!.y).toBeGreaterThanOrEqual(heading!.y + heading!.height - 1)
  expect(Math.abs(filters!.x + filters!.width - title!.x - title!.width)).toBeLessThan(2)
  expect(Math.abs(filters!.x - close!.x)).toBeLessThan(2)
  expect(Math.abs(firstPill!.x + firstPill!.width - title!.x - title!.width)).toBeLessThan(2)
  expect(Math.abs(lastPill!.x - close!.x)).toBeLessThan(2)
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  const images = sheet.locator('.portfolio-sheet__media img')
  const imageCount = await images.count()
  expect(imageCount).toBeGreaterThan(5)
  const allSources = await images.evaluateAll(items => items.map(item => item.getAttribute('src')))
  expect(new Set(allSources).size).toBe(imageCount)
  const [row, nextRow] = await images.evaluateAll(items => {
    const firstSix = items.slice(0, 6).map(item => {
      const { left, top, width } = item.getBoundingClientRect()
      return { left, top, width }
    })
    return [firstSix.slice(0, 5), firstSix[5]] as const
  })
  expect(new Set(row.map(item => item.left)).size).toBe(5)
  for (const item of row.slice(1)) {
    expect(Math.abs(item.top - row[0].top)).toBeLessThan(1)
    expect(Math.abs(item.width - row[0].width)).toBeLessThan(1)
  }
  expect(nextRow.top).toBeGreaterThan(row[0].top)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  for (const [label, source] of [
    [brandingFilter, /\/work\/brand-logo-orbit\.svg$/],
    [packagingFilter, /\/work\/brand-identity\.webp$/],
    [marketingFilter, /\/work\/brand-poster\.svg$/],
  ] as const) {
    const filter = sheet.getByRole('button', { name: label, exact: true })
    await filter.click()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(all).toHaveAttribute('aria-pressed', 'false')
    const filtered = await images.evaluateAll(items => items.map(item => item.getAttribute('src')))
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.length).toBeLessThan(imageCount)
    expect(filtered.some(path => path && source.test(path))).toBe(true)
  }
  await all.click()
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  await expect(images).toHaveCount(imageCount)
  await sheet.getByRole('button', { name: marketingFilter, exact: true }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page).toHaveURL(/#work$/)

  await trigger.click()
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  await expect(images).toHaveCount(imageCount)
  await sheet.getByRole('button', { name: 'إغلاق معرض الأعمال', exact: true }).click()
  await expect(sheet).toBeHidden()
  await page.locator('#work').getByRole('button', { name: webCategory, exact: true }).click()
  await expect(page.getByRole('dialog', { name: webCategory, exact: true })).toBeVisible()
})

test('the sheet opens at its full height and the gallery scrolls independently', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/?skipintro#work')
  await page.getByRole('button', { name: category, exact: true }).click()
  const sheet = page.getByRole('dialog', { name: category, exact: true })
  const scroller = sheet.locator('.portfolio-sheet__scroll')
  const top = () => sheet.evaluate(element => element.getBoundingClientRect().top)
  await expect(sheet).toBeVisible()
  const initialTop = await top()
  const navbarBottom = await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().bottom)
  expect(Math.abs(initialTop - navbarBottom)).toBeLessThan(38)
  const pageScroll = await page.evaluate(() => scrollY)
  const visibleRows = await scroller.evaluate(element => {
    const { top, bottom } = element.getBoundingClientRect()
    const rows = new Set(
      Array.from(element.querySelectorAll('.portfolio-sheet__card'), card => card.getBoundingClientRect())
        .filter(card => card.top >= top && card.bottom <= bottom + 1)
        .map(card => Math.round(card.top)),
    )
    return rows.size
  })
  expect(visibleRows).toBeGreaterThanOrEqual(3)

  const box = await scroller.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + 72)
  await page.mouse.wheel(0, 100)
  await expect.poll(() => scroller.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
  expect(Math.abs(await top() - initialTop)).toBeLessThan(1)

  await page.mouse.wheel(0, 6000)
  await expect(scroller.locator('.portfolio-sheet__media').last()).toBeInViewport()
  expect(Math.abs(await page.evaluate(() => scrollY) - pageScroll)).toBeLessThan(2)
  await expect(sheet.getByRole('button', { name: 'الكل', exact: true })).toBeInViewport()

  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await page.getByRole('button', { name: category, exact: true }).click()
  await expect.poll(async () => Math.abs(await top() - initialTop)).toBeLessThan(1)
  await expect.poll(() => scroller.evaluate(element => element.scrollTop)).toBe(0)
})

test('artwork previews fit the viewport and preserve the filtered gallery', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 550 })
  await page.goto('/?skipintro#work')
  await page.getByRole('button', { name: category, exact: true }).click()
  const sheet = page.getByRole('dialog', { name: category, exact: true })
  const filter = sheet.getByRole('button', { name: marketingFilter, exact: true })
  await filter.click()
  const gallery = sheet.locator('.portfolio-sheet__scroll')
  const imageTrigger = gallery.locator('.portfolio-sheet__media').last()
  await imageTrigger.scrollIntoViewIfNeeded()
  const originalScroll = await gallery.evaluate(element => element.scrollTop)
  expect(originalScroll).toBeGreaterThan(0)
  const title = (await gallery.locator('.portfolio-sheet__card-title').last().textContent())!
  const source = await imageTrigger.locator('img').getAttribute('src')
  await imageTrigger.click()

  const popup = page.getByRole('dialog', { name: title, exact: true })
  await expect(popup).toBeVisible()
  const art = popup.locator('.portfolio-image-viewer__art')
  const image = art.locator('img')
  await expect(image).toHaveAttribute('src', source!)
  await expect(image).toHaveCSS('object-fit', 'contain')
  const fitted = (await art.boundingBox())!
  expect(Math.abs(fitted.width / fitted.height - 1378 / 996)).toBeLessThan(0.01)
  expect(fitted.x).toBeGreaterThanOrEqual(0)
  expect(fitted.y + fitted.height).toBeLessThan(550)
  await page.keyboard.press('Escape')
  await expect(popup).toBeHidden()
  await expect(sheet).toBeVisible()
  await expect(imageTrigger).toBeFocused()
  await expect(filter).toHaveAttribute('aria-pressed', 'true')
  expect(Math.abs(await gallery.evaluate(element => element.scrollTop) - originalScroll)).toBeLessThan(2)

  await page.setViewportSize({ width: 1600, height: 1150 })
  const firstImage = gallery.locator('.portfolio-sheet__media').first()
  await firstImage.click()
  const largePopup = page.locator('.portfolio-image-viewer')
  await expect(largePopup).toBeVisible()
  const fullSize = (await largePopup.locator('.portfolio-image-viewer__art').boundingBox())!
  expect(fullSize.width).toBeCloseTo(1378, 0)
  expect(fullSize.height).toBeCloseTo(996, 0)
  await page.mouse.click(5, 5)
  await expect(largePopup).toBeHidden()
  await expect(firstImage).toBeFocused()
})

test.describe('mobile portfolio', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  async function swipe(
    touch: CDPSession,
    target: Locator,
    { x: deltaX = 0, y: deltaY = 0 }: { x?: number; y?: number },
    whileHeld?: () => Promise<void>,
  ) {
    const box = await target.boundingBox()
    if (!box) throw new Error('Swipe target has no visible bounds')
    const x = box.x + (box.width - deltaX) / 2
    const y = box.y + box.height / 2
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
    for (let step = 1; step <= 8; step++) {
      await pause(65)
      const fraction = step / 8
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + deltaX * fraction, y: y + deltaY * fraction, id: 1 }],
      })
    }
    await whileHeld?.()
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }

  test('a horizontal touch swipe reveals hidden filters while the gallery and page stay put', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Native swipe input uses Chromium device emulation.')
    await page.goto('/?skipintro#work')
    await page.getByRole('button', { name: category, exact: true }).tap()
    const sheet = page.getByRole('dialog', { name: category, exact: true })
    const filters = sheet.getByRole('group', { name: 'تصفية الأعمال', exact: true })
    const all = filters.getByRole('button', { name: 'الكل', exact: true })
    const revealedFilter = filters.getByRole('button', { name: packagingFilter, exact: true })
    const gallery = sheet.locator('.portfolio-sheet__scroll')
    await page.evaluate(() => document.fonts.ready)
    await expect(all).toBeInViewport()
    await expect(revealedFilter).not.toBeInViewport()
    const pageScroll = await page.evaluate(() => scrollY)
    const galleryScroll = await gallery.evaluate(element => element.scrollTop)
    const touch = await page.context().newCDPSession(page)

    // Pause before lifting the finger so the browser does not fling the strip.
    await swipe(touch, filters, { x: 325 }, () => pause(180))
    await expect.poll(() => filters.evaluate(element => element.scrollLeft)).toBeLessThan(0)
    await expect(revealedFilter).toBeInViewport({ ratio: 0.95 })
    await expect(all).toHaveAttribute('aria-pressed', 'true')
    expect(await gallery.evaluate(element => element.scrollTop)).toBe(galleryScroll)
    expect(Math.abs(await page.evaluate(() => scrollY) - pageScroll)).toBeLessThan(2)
    await revealedFilter.tap()
    await expect(revealedFilter).toHaveAttribute('aria-pressed', 'true')
    await touch.detach()
  })

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

    await swipe(touch, scroller, { y: 170 }, async () => {
      expect(Math.abs(await handleTop() - restTop)).toBeLessThan(1)
    })
    await expect(sheet).toBeVisible()
    await swipe(touch, scroller, { y: -170 })
    await expect.poll(() => scroller.evaluate(element => element.scrollTop)).toBeGreaterThan(0)
    expect(Math.abs(await handleTop() - restTop)).toBeLessThan(1)

    await swipe(touch, handle, { y: 40 }, async () => {
      await expect.poll(handleTop).toBeGreaterThan(restTop + 25)
    })
    await expect.poll(async () => Math.abs(await handleTop() - restTop)).toBeLessThan(1)
    await expect(sheet).toBeVisible()
    expect(Math.abs(await page.evaluate(() => scrollY) - pageScroll)).toBeLessThan(2)

    await swipe(touch, handle, { y: 170 })
    await expect(sheet).toBeHidden()
    await expect(trigger).toBeFocused()
    await expect(page).toHaveURL(/#work$/)
    await touch.detach()
  })
})
