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

  await page.getByRole('button', { name: 'Мои значки' }).click()
  await expect(page.getByRole('button', { name: 'Исследователь парка: получен' })).toBeVisible()
  await page.locator('[data-nav="map"]').click()
  await page.getByText('Все истории', { exact: true }).click()
  const route = page.getByLabel('Участок парка')
  await expect(route).toHaveValue('1')
  await expect(page.locator('.map-chip')).toHaveText('3 из 20 открытий')
  await route.selectOption('6')
  await page.locator('[data-mission="19"]').click()
  await expect(page.getByRole('dialog')).toContainText('Стол для гостей')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-mission="19"]')).toBeFocused()
  await expect(page.locator('[data-action="start"]')).toHaveText('Начать игру')
  await page.locator('[data-action="start"]').click()

  const stories: { answer: number; choice?: number }[] = [
    { answer: 1, choice: 0 },
    { answer: 1, choice: 1 },
    { answer: 2, choice: 2 },
    { answer: 0 },
    { answer: 1, choice: 1 },
    { answer: 2, choice: 0 },
    { answer: 0, choice: 1 },
    { answer: 1, choice: 2 },
    { answer: 2, choice: 0 },
    { answer: 0, choice: 1 },
    { answer: 1, choice: 0 },
    { answer: 2, choice: 1 },
    { answer: 0, choice: 0 },
    { answer: 1, choice: 0 },
    { answer: 2 },
    { answer: 0 },
    { answer: 1, choice: 0 },
  ]
  for (const [index, story] of stories.entries()) {
    const id = index + 3
    await expect(page.locator('.story-number')).toContainText(`История ${id + 1} из 20`)
    await page.getByRole('button', { name: 'Играть с этим планом' }).click()
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
  await page.getByRole('button', { name: 'Мои значки' }).click()
  await expect(page.getByRole('button', { name: 'Весь парк открыт: получен' })).toBeVisible()
  await page.request.post('/api/demo')
  expect(
    (await page.request.post('/api/demo/parent', { data: { pin: '0639', setup: true } })).ok(),
  ).toBe(true)
  await page.goto('/game/index.html#parents')
  await expect(page.locator('.parent-card').first()).toContainText('Пройдено 20 из 20 историй')
  await expect(page.locator('.parent-card details')).toHaveCount(20)
  const finalHistory = page.locator('.parent-card details').last()
  await finalHistory.locator('summary').click()
  await expect(finalHistory).toContainText('Куплю подставки для стола')

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Скачать результаты' }).click()
  const report = JSON.parse(await readFile((await (await download).path())!, 'utf8'))
  expect(report.stories).toHaveLength(20)
  expect(report.stories[3].remaining['Коплю']).toBe(0)
  expect(report.stories[18].remaining['Трачу']).toBe(0)
  await page.goto('/game/index.html')
  await expect(page.locator('.play-progress')).toHaveText('20 из 20 историй пройдено')
  expect(errors).toEqual([])
})
