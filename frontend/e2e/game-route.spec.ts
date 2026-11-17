import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test('existing saves unlock the new routes and all 20 stories can be completed', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.addInitScript(() => {
    const key = 'kopilka-park-v1'
    if (localStorage.getItem(key)) return
    const done = [
      { id: 0, alloc: [60, 20, 20], choice: 0, items: [] },
      { id: 1, alloc: [20, 50, 10], choice: null, items: [0, 1] },
      { id: 2, alloc: [20, 20, 20], choice: 1, items: [] },
    ].map((run) => ({
      ...run,
      phase: 'result',
      confirmed: true,
      quizPassed: true,
      finishedAt: '2026-11-16T12:00:00.000Z',
    }))
    localStorage.setItem(key, JSON.stringify({ version: 1, completed: done, active: done[2] }))
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/game/index.html')

  const route = page.getByLabel('Участок парка')
  await expect(route).toHaveValue('1')
  await expect(page.locator('.map-chip')).toHaveText('3 из 20 открытий')
  await expect(page.getByRole('button', { name: 'Исследователь парка: получен' })).toBeVisible()
  await route.selectOption('6')
  await page.locator('[data-mission="19"]').click()
  await expect(page.getByRole('dialog')).toContainText('Стол для гостей')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-mission="19"]')).toBeFocused()
  await expect(page.locator('[data-action="start"]')).toHaveText('Начать историю')
  await page.locator('[data-action="start"]').click()

  const stories: { from: number; amount: number; answer: number; choice?: number }[] = [
    { from: 0, amount: 60, answer: 1, choice: 0 },
    { from: 0, amount: 70, answer: 1, choice: 1 },
    { from: 0, amount: 60, answer: 2, choice: 2 },
    { from: 1, amount: 80, answer: 0 },
    { from: 1, amount: 70, answer: 1, choice: 1 },
    { from: 1, amount: 60, answer: 2, choice: 0 },
    { from: 2, amount: 50, answer: 0, choice: 1 },
    { from: 2, amount: 50, answer: 1, choice: 2 },
    { from: 2, amount: 60, answer: 2, choice: 0 },
    { from: 1, amount: 70, answer: 0, choice: 1 },
    { from: 0, amount: 50, answer: 1, choice: 0 },
    { from: 1, amount: 50, answer: 2, choice: 1 },
    { from: 1, amount: 50, answer: 0, choice: 0 },
    { from: 1, amount: 60, answer: 1, choice: 0 },
    { from: 1, amount: 70, answer: 2 },
    { from: 1, amount: 90, answer: 0 },
    { from: 2, amount: 100, answer: 1, choice: 0 },
  ]
  for (const [index, story] of stories.entries()) {
    const id = index + 3
    await expect(page.locator('.game-title .eyebrow')).toContainText(`История ${id + 1} ·`)
    const add = page.locator(`[data-adjust="${story.from}"][data-delta="10"]`)
    for (let coins = 0; coins < story.amount; coins += 10) await add.click()
    await page.locator('[data-action="allocation-next"]').click()
    if (story.choice === undefined) {
      await page.locator('[data-item="0"]').click()
      await page.locator('[data-item="1"]').click()
      if (id === 18) {
        await page.locator('[data-item="2"]').click()
        await page.locator('[data-action="confirm-event"]').click()
        await expect(page.locator('#event-feedback')).toContainText('нужно 100')
        await page.locator('[data-item="2"]').click()
      }
    } else {
      await page.locator(`[data-choice="${story.choice}"]`).click()
    }
    await page.locator('[data-action="confirm-event"]').click()
    if ([3, 6, 19].includes(id)) await page.reload()
    await page.locator('[data-action="to-quiz"]').click()
    await page.locator(`[data-answer="${story.answer}"]`).click()
    await page.locator('[data-action="finish"]').click()
    await expect(page.locator('.result')).toBeVisible()
    if (id < 19) await page.locator('[data-action="next-mission"]').click()
  }

  await expect(page.locator('.result .badge')).toContainText('Весь парк открыт')
  await page.getByRole('button', { name: 'Мои открытия' }).click()
  await expect(page.locator('.parent-card').first()).toContainText('Пройдено 20 из 20 историй')
  await expect(page.locator('.parent-card details')).toHaveCount(20)
  const finalHistory = page.locator('.parent-card details').last()
  await finalHistory.locator('summary').click()
  await expect(finalHistory).toContainText('Куплю подставки для стола')

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Скачать результаты' }).click()
  const report = JSON.parse(await readFile((await (await download).path())!, 'utf8'))
  expect(report.stories).toHaveLength(20)
  expect(report.stories[3].remaining['Коплю']).toBe(10)
  expect(report.stories[18].remaining['Трачу']).toBe(20)
  await page.locator('header [data-nav="map"]').click()
  await expect(page.locator('.map-chip')).toHaveText('20 из 20 открытий')
  await expect(page.getByRole('button', { name: 'Весь парк открыт: получен' })).toBeVisible()
  expect(errors).toEqual([])
})
