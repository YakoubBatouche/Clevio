import fs from 'node:fs/promises'
import { expect, test, type Locator } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('intro waits for hero assets, unlocks the unchanged scene, and replays on reload', async ({ page }) => {
  test.setTimeout(60000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1672, height: 941 })
  let releaseAsset = () => {}
  const assetGate = new Promise<void>((resolve) => { releaseAsset = resolve })
  const criticalImage = '**/hero-layers/separated/main-c-*.png'
  await page.route(criticalImage, async (route) => {
    await assetGate
    await route.continue()
  })

  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const loader = page.locator('#preloader')
    const lockedContent = page.locator('.site-header, #main-content, .site-footer, .skip-link')
    await expect(loader).toBeVisible()
    await expect(lockedContent).toHaveCount(4)
    await expect.poll(() => lockedContent.evaluateAll((elements) => elements.every((element) => (element as HTMLElement).inert))).toBe(true)
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
    await expect.poll(() => page.evaluate(() => {
      const timeline = (window as Window & { introTl?: { paused(): boolean; progress(): number } }).introTl
      return timeline ? { paused: timeline.paused(), progress: timeline.progress() } : null
    })).toEqual({ paused: true, progress: 0 })

    const piece = page.locator('[data-hero-piece="main-c"]')
    expect(await piece.evaluate((image) => (image as HTMLImageElement).complete)).toBe(false)
    const before = await piece.evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect()
      return { x, y, width, height }
    })
    await expect(piece).toHaveCSS('animation-name', 'none')
    releaseAsset()
    const flight = page.locator('.intro-handoff-c')
    await expect(flight).toBeAttached({ timeout: 12000 })
    await expect(flight).toHaveCSS('filter', 'none')
    await expect(flight).toHaveCSS('clip-path', /hero-crystal-clip/)

    await expect(loader).toBeHidden({ timeout: 22000 })
    expect(await page.evaluate(() => performance.now())).toBeGreaterThanOrEqual(7400)
    await expect.poll(() => lockedContent.evaluateAll((elements) => elements.every((element) => !(element as HTMLElement).inert))).toBe(true)
    await expect(page.locator('html')).not.toHaveClass(/intro-pending/)
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.intro-preloader__tiles, .intro-preloader__shockwave, .intro-handoff-c')).toHaveCount(0)
    await expect(piece).toHaveCSS('opacity', '1')
    await expect(piece).toHaveCSS('filter', 'none')
    await expect(piece).toHaveCSS('transform', 'none')
    await expect(page.locator('.hero__scene img[data-hero-piece^="orbit-"]')).toHaveCount(0)
    await expect(page.locator('[data-hero-glow]')).toHaveCSS('opacity', '1')
    await expect(page.locator('.hero__line-mask')).toHaveCount(3)
    await expect(page.locator('.hero__line')).toHaveText(['أفكار', 'خارج', 'الإطار'])
    await expect(piece).toHaveCSS('animation-name', 'none')
    const after = await piece.evaluate((element) => {
      const { x, y, width, height } = element.getBoundingClientRect()
      return { x, y, width, height }
    })
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(after[key] - before[key])).toBeLessThan(0.2)
    }
    await expect.poll(() => page.evaluate(() => {
      const timeline = (window as Window & { introTl?: { labels: Record<string, number>; progress(): number; duration(): number } }).introTl
      return timeline ? { labels: timeline.labels, progress: timeline.progress(), duration: timeline.duration() } : null
    })).toEqual({ labels: expect.objectContaining({ outline: 0, glass: 1.95, shatter: 3.6, hero: 4, exit: 7.35 }), progress: 1, duration: expect.closeTo(7.6, 4) })

    // Sample through the old drift's first cycle and the new shine's start.
    await page.waitForTimeout(6500)
    await expect(piece).toHaveCSS('transform', 'none')
    const resting = await piece.boundingBox()
    expect(resting).not.toBeNull()
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(resting![key] - after[key])).toBeLessThan(0.2)
    }
    await expect(page.locator('.hero__crystal-shine')).toHaveCount(1)
    await expect(page.locator('.hero__crystal-shine')).toHaveCSS('clip-path', /hero-crystal-clip/)

    await page.unrouteAll({ behavior: 'wait' })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(loader).toBeVisible()
    await expect.poll(() => lockedContent.evaluateAll((elements) => elements.every((element) => (element as HTMLElement).inert))).toBe(true)
    await expect(loader).toBeHidden({ timeout: 22000 })
    await expect.poll(() => lockedContent.evaluateAll((elements) => elements.every((element) => !(element as HTMLElement).inert))).toBe(true)
  } finally {
    releaseAsset()
  }
})

test('development bypass and reduced motion leave content unlocked without the loader', async ({ page }) => {
  const criticalImage = '**/hero-layers/separated/main-c-*.png'
  for (const mode of [
    { url: '/?skipintro', reducedMotion: 'no-preference' },
    { url: '/', reducedMotion: 'reduce' },
  ] as const) {
    await page.emulateMedia({ reducedMotion: mode.reducedMotion })
    let releaseAsset = () => {}
    const assetGate = new Promise<void>((resolve) => { releaseAsset = resolve })
    await page.route(criticalImage, async (route) => {
      await assetGate
      await route.continue()
    })
    try {
      await page.goto(mode.url, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('#preloader')).toBeHidden()
      const content = page.locator('.site-header, #main-content, .site-footer, .skip-link')
      await expect(content).toHaveCount(4)
      await expect.poll(() => content.evaluateAll((elements) => elements.every((element) => !(element as HTMLElement).inert))).toBe(true)
      await expect(page.locator('html')).not.toHaveClass(/intro-pending/)
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('#home')).toHaveCSS('opacity', '1')
    } finally {
      releaseAsset()
      await page.unrouteAll({ behavior: 'wait' })
    }
  }
})

test('desktop hero uses selectable Arabic text and individually interactive actions', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1672, height: 941 })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.getByRole('heading', { name: 'أفكار خارج الإطار', exact: true })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'التنقل الرئيسي', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'لنبدأ مشروعك', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'اكتشف خدماتنا', exact: true })).toBeVisible()
  await expect(page.locator('.hero__background')).toHaveAttribute('alt', '')
  await expect.poll(() => page.locator('.hero__background').evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  expect(await page.locator('h1').textContent()).toContain('أفكار')
  expect(await page.locator('html').getAttribute('dir')).toBe('rtl')
  expect(errors).toEqual([])
  if (testInfo.project.name === 'chromium') {
    await fs.mkdir('artifacts', { recursive: true })
    await page.screenshot({ path: 'artifacts/homepage-desktop.jpg', type: 'jpeg', quality: 94, fullPage: true })
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
      await page.screenshot({ path: 'artifacts/homepage-mobile.jpg', type: 'jpeg', quality: 94, fullPage: true })
    }
    if (width === 768 && testInfo.project.name === 'chromium') {
      await fs.mkdir('artifacts', { recursive: true })
      await page.screenshot({ path: 'artifacts/homepage-tablet.jpg', type: 'jpeg', quality: 94, fullPage: true })
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

test('hero contact action reaches the form and prepares a valid email draft', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'لنبدأ مشروعك', exact: true }).click()
  await expect(page).toHaveURL(/#contact$/)
  const form = page.getByRole('form', { name: 'تفاصيل مشروع جديد' })
  const name = form.getByLabel('الاسم الكامل')
  await expect(name).toBeFocused()
  await name.fill('عميل كليفيو')
  const contact = form.getByLabel('البريد الإلكتروني أو رقم الهاتف')
  await contact.fill('invalid')
  await form.getByLabel('نوع الخدمة أو المشروع').selectOption('التصميم الإبداعي')
  await form.getByLabel('تفاصيل المشروع').fill('هوية بصرية وموقع جديد')
  await form.getByRole('button', { name: 'جهّز تفاصيل مشروعك' }).click()
  expect(await contact.evaluate((input) => (input as HTMLInputElement).validity.valid)).toBe(false)
  await expect(form.getByRole('link', { name: 'فتح تطبيق البريد' })).not.toBeVisible()
  await contact.fill('hello@example.com')
  await form.getByRole('button', { name: 'جهّز تفاصيل مشروعك' }).click()
  const draft = form.getByRole('link', { name: 'فتح تطبيق البريد' })
  expect((await draft.getAttribute('href'))?.startsWith('mailto:info@clevio.dz?subject=')).toBe(true)
  expect(decodeURIComponent((await draft.getAttribute('href'))!)).toContain('هوية بصرية وموقع جديد')
  await form.getByLabel('تفاصيل المشروع').fill('فكرة محدثة')
  await expect(draft).not.toBeVisible()
})

test('eight service categories use three desktop columns and accessible details', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.getByRole('button', { name: 'اكتشف خدماتنا', exact: true }).click()
  await expect(page).toHaveURL(/#services$/)
  const cards = page.locator('#services .service-card')
  await expect(cards).toHaveCount(8)
  const boxes = await cards.evaluateAll((items) => items.map((item) => {
    const box = item.getBoundingClientRect()
    return { x: box.x, y: box.y }
  }))
  expect(new Set(boxes.slice(0, 3).map((box) => Math.round(box.x))).size).toBe(3)
  expect(Math.max(...boxes.slice(0, 3).map((box) => box.y)) - Math.min(...boxes.slice(0, 3).map((box) => box.y))).toBeLessThan(2)
  const card = cards.filter({ hasText: 'التصميم الإبداعي' })
  await card.click()
  const dialog = page.getByRole('dialog', { name: 'التصميم الإبداعي', exact: true })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(card).toBeFocused()
  await card.click()
  await dialog.getByRole('button', { name: 'لنتحدث عن مشروعك', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page).toHaveURL(/#contact$/)
  await expect(page.locator('#contact input[name="name"]')).toBeFocused()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#services')
  await expect(cards).toHaveCount(8)
  const mobile = await cards.evaluateAll((items) => items.slice(0, 3).map((item) => Math.round(item.getBoundingClientRect().x)))
  expect(new Set(mobile).size).toBe(1)
})

test('services navigation reaches the real homepage section', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('navigation', { name: 'التنقل الرئيسي', exact: true }).getByRole('link', { name: 'خدماتنا', exact: true }).click()
  await expect(page).toHaveURL(/#services$/)
  await expect(page.locator('#services-heading')).toBeInViewport()
  await expect(page.locator('#services')).toBeFocused()
})

test('homepage and service details pass automated accessibility checks', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  expect(await page.locator('main').count()).toBe(1)
  const homepage = await new AxeBuilder({ page }).analyze()
  expect(homepage.violations).toEqual([])
  await page.locator('#services .service-card').filter({ hasText: 'التطوير التقني' }).click()
  await expect(page.getByRole('dialog', { name: 'التطوير التقني', exact: true })).toBeVisible()
  const details = await new AxeBuilder({ page }).analyze()
  expect(details.violations).toEqual([])
})

test('a desktop wheel gesture glides to the next section without skipping it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/?skipintro')
  const target = await page.locator('#services').evaluate((element) => Math.max(0, (element as HTMLElement).offsetTop - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-offset'))))
  await page.mouse.move(720, 500)
  await page.mouse.wheel(0, 420)
  await page.mouse.wheel(0, 60)
  await page.mouse.wheel(0, 40)
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeGreaterThan(target - 4)
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeLessThan(target + 4)
})

async function expectFullyRevealed(target: Locator) {
  await expect(target).toBeVisible()
  await expect.poll(() => target.evaluate((element) => {
    for (let current: Element | null = element; current && current.tagName !== 'MAIN'; current = current.parentElement) {
      const style = getComputedStyle(current)
      if (style.opacity !== '1' || style.transform !== 'none') return false
    }
    return true
  }), { timeout: 4000 }).toBe(true)
}

test('normal-motion navigation reveals services and contact with visible focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.goto('/')
  await page.getByRole('button', { name: 'اكتشف خدماتنا', exact: true }).click()
  await page.mouse.move(0, 0)
  await expect(page).toHaveURL(/#services$/)
  await expect(page.locator('#services')).toBeFocused()
  const workHeading = page.locator('#services-heading')
  await expect(workHeading).toBeInViewport({ ratio: 1 })
  await expectFullyRevealed(workHeading)
  for (const card of await page.locator('#services .service-card').all()) {
    await expectFullyRevealed(card)
  }

  await page.locator('#services .service-card').first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'لنتحدث عن مشروعك', exact: true }).click()
  await page.mouse.move(0, 0)
  await expect(page).toHaveURL(/#contact$/)
  const input = page.locator('#contact input[name="name"]')
  await expect(input).toBeFocused()
  await expect(input).toBeInViewport({ ratio: 1 })
  await expectFullyRevealed(input)
  await expectFullyRevealed(page.getByRole('form', { name: 'تفاصيل مشروع جديد' }))
})

test('footer home link returns to the hero and restores section focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.goto('/#contact')
  await page.getByRole('contentinfo').getByRole('link', { name: 'الرئيسية', exact: true }).click()
  await expect(page).toHaveURL(/#home$/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2)
  await expect(page.locator('#home')).toBeFocused()
  await expect(page.locator('h1')).toBeInViewport({ ratio: 1 })
  await expectFullyRevealed(page.locator('h1'))
})

test('direct contact links reveal content and keep a focused field on screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.goto('/#contact')
  await expect(page.locator('html')).not.toHaveClass(/intro-pending/, { timeout: 20000 })
  await expect(page).toHaveURL(/#contact$/)
  const heading = page.getByRole('heading', { name: 'لديك فكرة؟ لنحوّلها إلى شيء مميز.', exact: true })
  await expect(heading).toBeInViewport({ ratio: 1 })
  await expectFullyRevealed(heading)
  const input = page.locator('#contact input[name="name"]')
  await input.focus()
  await expect(input).toBeFocused()
  await expect(input).toBeInViewport({ ratio: 1 })
  await expectFullyRevealed(input)
  await expectFullyRevealed(page.getByRole('form', { name: 'تفاصيل مشروع جديد' }))
})

test('floating artwork moves gently while the background and headline stay still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.goto('/')
  await expect(page.locator('html')).not.toHaveClass(/intro-pending/, { timeout: 22000 })
  await page.evaluate(() => document.fonts.ready)
  for (const line of await page.locator('.hero__line').all()) {
    await expect(line).toHaveCSS('opacity', '1')
  }

  const floats = page.locator('.hero__float')
  const positions = () => floats.evaluateAll((elements) => elements.map((element) => {
    const { x, y } = element.getBoundingClientRect()
    return { x, y }
  }))
  const initial = await positions()
  expect(initial).toHaveLength(3)
  const background = await page.locator('.hero__background').boundingBox()
  const headline = await page.locator('.hero__line').last().boundingBox()

  await expect.poll(async () => (await positions()).every((position, index) =>
    Math.hypot(position.x - initial[index].x, position.y - initial[index].y) > 0.3,
  ), { timeout: 6000 }).toBe(true)

  for (const [selector, initialBox] of [
    ['.hero__background', background],
    ['.hero__line-mask:last-child .hero__line', headline],
  ] as const) {
    const current = await page.locator(selector).boundingBox()
    expect(initialBox).not.toBeNull()
    expect(current).not.toBeNull()
    expect(Math.hypot(current!.x - initialBox!.x, current!.y - initialBox!.y)).toBeLessThan(0.5)
  }
})

test('pointer movement stays subtle and resets when leaving the artwork', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.goto('/')
  await expect(page.locator('html')).not.toHaveClass(/intro-pending/, { timeout: 22000 })
  const scene = await page.locator('.hero__artwork').boundingBox()
  expect(scene).not.toBeNull()
  const translations = () => page.locator('.hero__float-track[data-hero-parallax]').evaluateAll((elements) =>
    elements.map((element) => {
      const transform = getComputedStyle(element).transform
      const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform)
      return Math.hypot(matrix.m41, matrix.m42)
    }),
  )

  await page.mouse.move(scene!.x + scene!.width * 0.15, scene!.y + scene!.height * 0.25)
  await expect.poll(async () => {
    const distances = await translations()
    return distances.length === 3 && distances.every((distance) => distance > 0.3 && distance < 20)
  }).toBe(true)

  await page.mouse.move(scene!.x + scene!.width * 0.85, scene!.y + scene!.height * 0.55)
  await expect.poll(async () => (await translations()).every((distance) => distance < 0.1)).toBe(true)
})

test('reduced motion leaves the full headline and actions visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('h1')).toHaveCSS('opacity', '1')
  expect(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length)).toBe(0)
  for (const line of await page.locator('.hero__line').all()) {
    await expect(line).toHaveCSS('opacity', '1')
  }
  const baseline = await page.locator('.hero__background').boundingBox()
  expect(baseline).not.toBeNull()
  for (const image of await page.locator('.hero__float').all()) {
    const box = await image.boundingBox()
    expect(box).not.toBeNull()
    expect(Math.hypot(box!.x - baseline!.x, box!.y - baseline!.y)).toBeLessThan(0.1)
    expect(Math.abs(box!.width - baseline!.width)).toBeLessThan(0.1)
    expect(Math.abs(box!.height - baseline!.height)).toBeLessThan(0.1)
  }
})


test('separated C, pedestal and orbit keep the original cover registration', async ({ page }) => {
  for (const width of [390, 1672]) {
    await page.setViewportSize({ width, height: 941 })
    await page.goto('/')
    const parts = page.locator('[data-hero-piece]')
    await expect(parts).toHaveCount(4)
    const images = page.locator('img[data-hero-piece]')
    const orbits = page.locator('svg[data-hero-piece^="orbit-"]')
    await expect(images).toHaveCount(2)
    await expect(orbits).toHaveCount(2)
    await expect.poll(() => images.evaluateAll((items) => items.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)
    const background = await page.locator('.hero__background').boundingBox()
    const frame = await page.locator('.hero__scene').boundingBox()
    expect(background).not.toBeNull()
    expect(frame).not.toBeNull()
    const scale = Math.max(background!.width / 7680, background!.height / 4320)
    const sceneWidth = 7680 * scale
    const sceneHeight = 4320 * scale
    const expectedX = background!.x + (background!.width - sceneWidth) * (width < 980 ? 0.02 : 0.5)
    expect(Math.abs(frame!.x - expectedX)).toBeLessThan(0.15)
    expect(Math.abs(frame!.y - (background!.y + background!.height - sceneHeight))).toBeLessThan(0.15)
    expect(Math.abs(frame!.width - sceneWidth)).toBeLessThan(0.15)
    expect(Math.abs(frame!.height - sceneHeight)).toBeLessThan(0.15)
    for (const orbit of await orbits.all()) {
      await expect(orbit).toHaveAttribute('viewBox', '0 0 7680 4320')
      const box = await orbit.boundingBox()
      expect(box).not.toBeNull()
      for (const key of ['x', 'y', 'width', 'height'] as const) {
        expect(Math.abs(box![key] - frame![key])).toBeLessThan(0.15)
      }
    }
    for (const part of await parts.all()) await expect(part).toHaveCSS('animation-name', 'none')
  }
})

test('fixed glass navigation keeps section headings clear and groups work above partners', async ({ page }) => {
  await page.goto('/#services')
  const header = page.locator('.site-header')
  await expect(header).toHaveCSS('position', 'fixed')
  await expect(page.locator('#services-heading')).toBeInViewport()
  const headerBottom = await header.evaluate((element) => element.getBoundingClientRect().bottom)
  expect(await page.locator('#services-heading').evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThan(headerBottom)
  await page.getByRole('navigation', { name: 'التنقل الرئيسي', exact: true }).getByRole('link', { name: 'أعمالنا', exact: true }).click()
  await expect(page).toHaveURL(/#work$/)
  await expect(page.locator('#work-heading')).toBeInViewport()
  await expect(page.locator('#partners .work-showcase__card')).toHaveCount(8)
  await expect(page.locator('.work-showcase__card button, .work-showcase__card a')).toHaveCount(0)
  expect(await page.locator('#work-heading').evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThan(headerBottom)
  const lastCard = await page.locator('.work-showcase__card').last().boundingBox()
  const partnersTitle = await page.locator('#partners-heading').boundingBox()
  expect(partnersTitle!.y).toBeGreaterThan(lastCard!.y + lastCard!.height)
})
