import { expect, test } from '@playwright/test'

test('game is a separate navigation item on the home and tasks screens', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  await expect(page.locator('.home-task')).toBeVisible()
  for (const [route, width] of [
    ['/app', 1440],
    ['/app/activities', 390],
  ] as const) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto(route)
    await expect(page.locator('main').getByRole('link', { name: 'Игра', exact: true })).toHaveCount(
      0,
    )
    await page
      .getByRole('navigation', {
        name: width < 768 ? 'Навигация на телефоне' : 'Основная навигация',
      })
      .getByRole('link', { name: 'Игра', exact: true })
      .click()
    await expect(page).toHaveURL(/\/game\/index.html$/)
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
              const viewport = root
                .querySelector('.activity-carousel-viewport')!
                .getBoundingClientRect()
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
