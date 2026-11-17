import { expect, test } from '@playwright/test'

test('home game entry has its own row after the carousel at every breakpoint', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  await expect(page.locator('.home-task')).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  for (const width of [320, 390, 640, 768, 820, 1024, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    // Resizing reinitializes Embla; measure every rectangle in the same frame.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const link = document.querySelector('.home-park-link')!.getBoundingClientRect()
            const carousel = document.querySelector('.activity-carousel')!.getBoundingClientRect()
            const footer = document
              .querySelector('.activity-carousel-footer')!
              .getBoundingClientRect()
            return link.top - Math.max(carousel.bottom, footer.bottom)
          }),
        { message: `game link below carousel and counter at ${width}px` },
      )
      .toBeGreaterThanOrEqual(10)
    const link = await page.locator('.home-park-link').boundingBox()
    expect(link!.x).toBeGreaterThanOrEqual(0)
    expect(link!.x + link!.width).toBeLessThanOrEqual(width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('home and tasks both open the game map through a clearly named link', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  await expect(page.locator('.home-task')).toBeVisible()
  await page.waitForLoadState('networkidle')
  for (const route of ['/app', '/app/activities']) {
    await page.goto(route)
    await page.getByRole('link', { name: 'Открыть карту игры', exact: false }).click()
    await expect(page).toHaveURL(/\/game\/index.html$/)
    await expect(page.locator('[data-nav="map"]')).toHaveClass(/active/)
    await expect(page.locator('main')).toContainText('Парк маленьких открытий')
  }
})

test('carousel arrows leave all task text unobstructed on narrow screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  const carousel = page.locator('.activity-carousel')
  await expect(carousel.getByRole('button', { name: 'Следующее задание' })).toBeEnabled()
  await page.evaluate(() => document.fonts.ready)
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (let slide = 0; slide < 6; slide++) {
      await expect
        .poll(
          () =>
            carousel.evaluate((root) => {
              const card = root.querySelector('[data-active="true"]')!
            const viewport = root.querySelector('.activity-carousel-viewport')!.getBoundingClientRect()
            if (Math.abs(card.getBoundingClientRect().left - viewport.left) > 1.5) {
              return ['active slide is not aligned to the viewport']
            }
              const arrows = [...root.querySelectorAll('.activity-carousel-arrow')].map((arrow) =>
                arrow.getBoundingClientRect(),
              )
              const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT)
              const collisions: string[] = []
              while (walker.nextNode()) {
                const node = walker.currentNode
                if (!node.textContent?.trim() || node.parentElement?.closest('svg')) continue
                const range = document.createRange()
                range.selectNodeContents(node)
                for (const text of range.getClientRects()) {
                  if (
                    arrows.some(
                      (arrow) =>
                        Math.min(text.right, arrow.right) - Math.max(text.left, arrow.left) > 1 &&
                        Math.min(text.bottom, arrow.bottom) - Math.max(text.top, arrow.top) > 1,
                    )
                  ) {
                    collisions.push(node.textContent.trim())
                  }
                }
              }
              return collisions
            }),
          { message: `unobstructed task ${slide + 1} at ${width}px` },
        )
        .toEqual([])
      await carousel.getByRole('button', { name: 'Следующее задание' }).click()
    }
  }
})
