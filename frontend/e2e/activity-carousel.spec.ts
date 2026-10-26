import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const qaDirectory = process.env.PLAYWRIGHT_ARTIFACTS_DIR ?? '../artifacts/qa'

async function enter(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
  const carousel = page.getByRole('region', { name: 'Задания для полезных привычек' })
  await carousel.scrollIntoViewIfNeeded()
  await expect(carousel.getByRole('button', { name: 'Следующее задание' })).toBeEnabled()
  return carousel
}

test('tasks loop in both directions, show actionable steps and open the selected task', async ({
  page,
}) => {
  const carousel = await enter(page)
  const before = await (await page.request.get('/api/state')).json()
  const tasks = before.activities as {
    id: string
    title: string
    steps: string[]
    completed_at: string | null
  }[]
  let index = tasks.findIndex((task) => !task.completed_at)
  const active = carousel.locator('[data-active="true"]')
  await expect(active.getByRole('heading', { name: tasks[index].title, exact: true })).toBeVisible()
  await expect(active.locator('.activity-steps > li')).toHaveCount(3)
  await expect(active.getByText('Зачем?', { exact: true })).toBeVisible()
  for (const direction of [1, -1]) {
    for (let step = 0; step < tasks.length * 2 + 1; step++) {
      await carousel
        .getByRole('button', { name: direction === 1 ? 'Следующее задание' : 'Предыдущее задание' })
        .click()
      index = (index + direction + tasks.length) % tasks.length
      await expect(
        active.getByRole('heading', { name: tasks[index].title, exact: true }),
      ).toBeVisible()
      await expect(active).toBeInViewport({ ratio: 0.95 })
    }
  }
  expect((await (await page.request.get('/api/state')).json()).balances).toEqual(before.balances)
  await active.getByRole('button', { name: 'Начать задание' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: tasks[index].title, exact: true })).toBeVisible()
  await expect(dialog.locator('.activity-steps > li > span:last-child')).toHaveText(
    tasks[index].steps,
  )
  await dialog.getByRole('button', { name: 'Я попробовал!' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(active.getByRole('heading', { name: tasks[index].title, exact: true })).toBeVisible()
  await expect(active.getByText('Выполнено', { exact: true })).toBeVisible()
  await expect(carousel.getByText('Выполнено: 2 из 6', { exact: true })).toBeVisible()
  expect((await (await page.request.get('/api/state')).json()).balances).toEqual(before.balances)
})

test('arrows stay vertically centered and reachable on every supported width; keyboard and axe work', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const carousel = await enter(page)
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await carousel.scrollIntoViewIfNeeded()
    const stage = await carousel.locator('.activity-carousel-stage').boundingBox()
    for (const name of ['Предыдущее задание', 'Следующее задание']) {
      const bounds = await carousel.getByRole('button', { name }).boundingBox()
      expect(Math.abs(bounds!.y + bounds!.height / 2 - stage!.y - stage!.height / 2)).toBeLessThan(
        1,
      )
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
      expect(bounds!.width).toBeGreaterThanOrEqual(44)
      expect(bounds!.height).toBeGreaterThanOrEqual(44)
    }
    const initial = await carousel.getByRole('status').innerText()
    await carousel.getByRole('button', { name: 'Следующее задание' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(carousel.getByRole('status')).not.toHaveText(initial)
    await page.keyboard.press('ArrowLeft')
    await expect(carousel.getByRole('status')).toHaveText(initial)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy()
    if (width === 390 || width === 1440) {
      await page.evaluate(() => document.fonts.ready)
      await carousel.screenshot({
        path: `${qaDirectory}/activity-carousel-${width}.png`,
        animations: 'disabled',
      })
      const audit = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(audit.violations).toEqual([])
    }
  }
})

test('mobile touch swipes navigate without changing money or completion state', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173',
    viewport: { width: 390, height: 1000 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const carousel = await enter(page)
  const before = await (await page.request.get('/api/state')).json()
  const initial = await carousel.getByRole('status').innerText()
  const box = await carousel.locator('.activity-carousel-viewport').boundingBox()
  const cdp = await context.newCDPSession(page)
  const y = box!.y + 100
  const swipe = async (from: number, to: number) => {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: from, y }],
    })
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: from + ((to - from) * i) / 8, y }],
      })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  await swipe(box!.x + box!.width * 0.8, box!.x + box!.width * 0.2)
  await expect(carousel.getByRole('status')).not.toHaveText(initial)
  await swipe(box!.x + box!.width * 0.2, box!.x + box!.width * 0.8)
  await expect(carousel.getByRole('status')).toHaveText(initial)
  const after = await (await page.request.get('/api/state')).json()
  expect(after.balances).toEqual(before.balances)
  expect(after.activities.map((a: { completed_at: string | null }) => a.completed_at)).toEqual(
    before.activities.map((a: { completed_at: string | null }) => a.completed_at),
  )
  await context.close()
})
