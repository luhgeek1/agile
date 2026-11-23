import { expect, test } from '@playwright/test'

test('game is a separate navigation item on the home and tasks screens', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Я ребёнок' }).click()
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

test('tasks and recent records fit at narrow widths and align on desktop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Я ребёнок' }).click()
  const tasks = page.getByRole('region', { name: 'Выбери задание' })
  const recent = page.getByRole('region', { name: 'Последние шаги' })
  await expect(tasks.getByRole('button')).toHaveCount(6)
  await expect(recent.locator('.transaction-item')).toHaveCount(5)
  await page.evaluate(() => document.fonts.ready)

  for (const width of [320, 360, 390, 768, 1024, 1366, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const control of await tasks.getByRole('button').all()) {
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    }
    const taskHeading = (await tasks.getByRole('heading').boundingBox())!
    const recentHeading = (await recent
      .getByRole('heading', { name: 'Последние шаги' })
      .boundingBox())!
    if (width >= 1024) {
      expect(Math.abs(taskHeading.y - recentHeading.y)).toBeLessThan(2)
      expect(recentHeading.x).toBeGreaterThan(taskHeading.x)
    } else if (width < 768) {
      expect(recentHeading.y).toBeGreaterThan(taskHeading.y)
    }
  }
})
