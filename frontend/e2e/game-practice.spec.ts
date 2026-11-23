import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('practice persists, awards one badge, preserves money and resets only game data', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Я ребёнок' }).click()
  await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
  const before = await (await page.request.get('/api/state')).json()
  await page.getByRole('link', { name: 'Игра', exact: true }).click()
  await page.locator('[data-nav="practice"]').first().click()
  await page.locator('[data-practice-answer="2"]').click()
  await expect(page.locator('#practice-feedback')).toContainText('Давай разберёмся')
  await expect(page.locator('[data-practice="next"]')).toBeDisabled()
  for (const [index, answer] of [0, 1, 2, 1, 2, 0].entries()) {
    await page.locator(`[data-practice-answer="${answer}"]`).click()
    if (index === 2) {
      await page.reload()
      await expect(page.locator('[data-practice="next"]')).toBeEnabled()
    }
    await page.locator('[data-practice="next"]').click()
  }
  await expect(page.getByRole('heading', { name: 'Знаток трёх отсеков' })).toBeVisible()
  await page.locator('[data-nav="map"]').first().click()
  await page.getByRole('button', { name: 'Мои значки' }).click()
  await expect(page.locator('.passport-count')).toHaveText('1 из 6')
  await page.locator('[data-badge="4"]').click()
  await expect(page.getByRole('dialog')).toContainText('уже в твоей коллекции')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-badge="4"]')).toBeFocused()
  await page.reload()
  await expect(page.locator('.passport-count')).toHaveText('1 из 6')
  await page.locator('[data-nav="map"]').click()
  await page.locator('[data-nav="practice"]').click()
  await page.locator('[data-practice="restart"]').click()
  await page.locator('[data-nav="map"]').first().click()
  await page.getByRole('button', { name: 'Мои значки' }).click()
  await expect(page.locator('.passport-count')).toHaveText('1 из 6')
  const after = await (await page.request.get('/api/state')).json()
  expect(after).toEqual(before)
  expect(
    (await page.request.post('/api/demo/parent', { data: { pin: '0639', setup: true } })).ok(),
  ).toBe(true)
  await page.goto('/app/parent')
  await page.getByRole('link', { name: 'Прогресс в игре' }).click()
  const download = page.waitForEvent('download')
  await page.locator('[data-action="export"]').click()
  const exported = JSON.parse(await readFile((await (await download).path())!, 'utf8'))
  expect(exported.practice.mastered).toHaveLength(6)
  expect(exported.practice.topics).toContain('Добро без покупки')
  await page.locator('[data-action="reset"]').click()
  await page.locator('[data-action="close"]').click()
  await expect(page.locator('[data-action="reset"]')).toBeVisible()
  await page.locator('[data-action="reset"]').click()
  await page.locator('[data-action="confirm-reset"]').click()
  await expect(page.getByText('Пройдено 0 из 20 историй.')).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Основная навигация' })
    .getByRole('link', { name: 'Игра' })
    .click()
  await expect(page.getByRole('heading', { name: 'Парк маленьких открытий' })).toBeVisible()
  expect((await (await page.request.get('/api/demo/parent')).json()).unlocked).toBe(false)
  await page.getByRole('button', { name: 'Мои значки' }).click()
  await expect(page.locator('.passport-count')).toHaveText('0 из 6')
  expect(await (await page.request.get('/api/state')).json()).toEqual(before)
})

test('malformed storage and unavailable storage keep the game playable', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('kopilka-park-v1', JSON.stringify({ version: 1, completed: [null] }))
    localStorage.setItem(
      'kopilka-practice-v1',
      JSON.stringify({ cursor: 999, round: [], mastered: [99] }),
    )
  })
  await page.goto('/game/index.html')
  await expect(page.locator('.play-progress')).toHaveText('0 из 20 историй пройдено')
  await page.locator('[data-nav="practice"]').first().click()
  await expect(page.locator('.practice-position')).toContainText('Ситуация 1 из 6')
  await page.locator('[data-practice-answer="0"]').click()
  await expect(page.locator('[data-practice="next"]')).toBeEnabled()
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage denied')
    }
    Storage.prototype.getItem = () => {
      throw new Error('Storage denied')
    }
  })
  await page.reload()
  await expect(page.getByText('Тренировка работает, но браузер', { exact: false })).toBeVisible()
  await page.locator('[data-practice-answer="0"]').click()
  await page.locator('[data-practice="next"]').click()
  await expect(page.locator('.practice-position')).toContainText('Ситуация 2 из 6')
})

test('real habit progress persists after completing a task', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Я ребёнок' }).click()
  await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
  await page.goto('/app/activities')
  const task = page.locator('.activity-card').filter({ hasText: 'Пересчитай монеты в копилке' })
  await task.getByRole('button', { name: 'Начать задание' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Готово!' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(task.getByText('Выполнено', { exact: true })).toBeVisible()
  await page.reload()
  await expect(task.getByText('Выполнено', { exact: true })).toBeVisible()
})

test('game navigation supports direct links, browser history and reload', async ({ page }) => {
  await page.goto('/game/index.html#practice')
  await expect(page.getByRole('heading', { name: 'Мастерская решений' })).toBeVisible()
  await page.locator('[data-nav="map"]').click()
  await page.getByRole('button', { name: 'Мои значки' }).click()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Парк маленьких открытий' })).toBeVisible()
  await page.goForward()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Мои значки' })).toBeVisible()
})
