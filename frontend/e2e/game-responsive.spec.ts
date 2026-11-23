import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const directory = process.env.PLAYWRIGHT_ARTIFACTS_DIR ?? '../artifacts/qa'
const viewports = [
  [320, 568],
  [360, 800],
  [390, 844],
  [430, 932],
  [568, 320],
  [768, 1024],
  [820, 1180],
  [844, 390],
  [1024, 768],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
]

async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  const clipped = await page
    .locator('button:visible, a:visible:not(.skip)')
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const box = element.getBoundingClientRect()
          return (
            box.x < -1 ||
            box.right > innerWidth + 1 ||
            element.scrollWidth > element.clientWidth + 2
          )
        })
        .map((element) => element.textContent),
    )
  expect(clipped).toEqual([])
}

for (const [width, height] of viewports) {
  test(`park ${width}x${height}: every surface, controls and accessibility`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/game/index.html')
    const inspect = async (screen: string) => {
      await fits(page)
      if ([390, 768, 1440].includes(width)) {
        await page.screenshot({
          path: `${directory}/game-${screen}-${width}-${info.project.name}.png`,
          fullPage: true,
        })
      }
      if ([390, 1440].includes(width)) {
        const audit = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
        expect
          .soft(
            audit.violations.map((issue) => ({
              rule: issue.id,
              nodes: issue.nodes.map((node) => ({
                target: node.target,
                reason: node.failureSummary,
              })),
            })),
            screen,
          )
          .toEqual([])
      }
    }
    await inspect('map')
    await page.getByText('Все истории', { exact: true }).click()
    const route = page.getByLabel('Участок парка')
    for (const index of ['1', '2', '3', '4', '5', '6']) {
      await route.selectOption(index)
      await fits(page)
      const overlaps = await page.locator('.landmark').evaluateAll((stops) =>
        stops.some((stop, i) => {
          const a = stop.getBoundingClientRect()
          return stops.slice(i + 1).some((other) => {
            const b = other.getBoundingClientRect()
            return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
          })
        }),
      )
      expect(overlaps, `separate stops on route ${index}`).toBe(false)
    }
    await route.selectOption('0')
    await page.getByRole('button', { name: 'Мои значки' }).click()
    await page.locator('[data-badge="0"]').click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await fits(page)
    const bounds = await dialog.boundingBox()
    expect(bounds!.height).toBeLessThanOrEqual(height)
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-badge="0"]')).toBeFocused()
    await page.locator('[data-nav="map"]').click()
    await page.locator('[data-action="start"]').click()
    await inspect('allocate')
    await page.locator('[data-action="ready-plan"]').click()
    await inspect('choice')
    await page.locator('[data-choice="2"]').click()
    await page.locator('[data-action="confirm-event"]').click()
    await page.locator('[data-action="to-quiz"]').click()
    await inspect('quiz')
    await page.locator('[data-answer="0"]').click()
    await page.locator('[data-action="finish"]').click()
    await inspect('result')
    await page.locator('[data-nav="map"]').click()
    await page.locator('[data-nav="practice"]').click()
    await inspect('practice')
    await page.locator('[data-practice-answer="0"]').click()
    await inspect('feedback')
    await page.locator('[data-nav="map"]').click()
    await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toBeVisible()
    expect(errors).toEqual([])
  })
}
