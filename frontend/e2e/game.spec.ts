import { test, expect, type Page } from '@playwright/test'

async function allocate(page: Page, amounts: number[]) {
  await page.getByText('Разложить монеты самому', { exact: true }).click()
  for (const [index, amount] of amounts.entries()) {
    for (let i = 0; i < amount / 10; i++) {
      await page.locator(`[data-adjust="${index}"][data-delta="10"]`).click()
    }
  }
  await expect(page.locator('#remaining')).toHaveText('0')
  await page.locator('[data-action="allocation-next"]').click()
}

test('three stories: choices, insufficient funds, reload, rewards and replay', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/game/index.html')
  await page.locator('[data-action="start"]').click()
  await allocate(page, [60, 20, 20])
  await page.locator('[data-choice="1"]').click()
  await page.locator('[data-action="confirm-event"]').click()
  await expect(page.locator('#event-feedback')).toContainText('не хватает')
  await page.locator('[data-choice="0"]').click()
  await page.locator('[data-action="confirm-event"]').click()
  for (let mission = 0; mission < 3; mission++) {
    await page.reload()
    await page.locator('[data-action="to-quiz"]').click()
    await page.locator(`[data-answer="${(mission + 1) % 3}"]`).click()
    await expect(page.locator('[data-action="finish"]')).toBeDisabled()
    await page.locator(`[data-answer="${mission}"]`).click()
    await page.locator('[data-action="finish"]').click()
    await expect(page.locator('.result')).toBeVisible()
    if (mission < 2) {
      await page.locator('[data-action="next-mission"]').click()
      await allocate(page, mission === 0 ? [20, 50, 10] : [30, 30, 0])
      if (mission === 0) {
        await page.locator('[data-item="0"]').click()
        await page.locator('[data-item="1"]').click()
      } else {
        await page.locator('[data-choice="1"]').click()
      }
      await page.locator('[data-action="confirm-event"]').click()
    }
  }
  await page.reload()
  await page.locator('[data-nav="map"]').first().click()
  await expect(page.locator('.play-progress')).toHaveText('3 из 20 историй пройдено')
  await expect(page.locator('#route-select')).toHaveValue('1')
  await page.getByText('Все истории', { exact: true }).click()
  await page.getByLabel('Участок парка').selectOption('0')
  await page.locator('[data-mission="0"]').click()
  await allocate(page, [100, 0, 0])
  await page.locator('[data-choice="2"]').click()
  await page.locator('[data-action="confirm-event"]').click()
  await page.locator('[data-action="to-quiz"]').click()
  await page.locator('[data-answer="0"]').click()
  await page.locator('[data-action="finish"]').click()
  await page.locator('[data-nav="map"]').last().click()
  await expect(page.locator('.play-progress')).toHaveText('3 из 20 историй пройдено')
  expect(errors).toEqual([])
})

test('a ready plan leads into play, and bottom navigation saves the current turn', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.request.post('/api/demo')
  await page.goto('/game/index.html')
  await page.getByRole('button', { name: 'Начать игру' }).click()
  await expect(page.locator('.manual-plan')).not.toHaveAttribute('open')
  await expect(page.locator('.plan-pockets strong')).toHaveText(['60', '40', '0'])
  await page.getByRole('button', { name: 'Играть с этим планом' }).click()
  await page.getByRole('button', { name: /Наклейки/ }).click()
  const nav = page.getByRole('navigation', { name: 'Основная навигация' })
  await expect(nav).toHaveCSS('position', 'fixed')
  await nav.getByRole('link', { name: 'Копилка' }).click()
  await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Навигация на телефоне' })
    .getByRole('link', { name: 'Игра' })
    .click()
  await page.getByRole('button', { name: 'Продолжить' }).click()
  await expect(page.getByRole('button', { name: /Наклейки/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'Проверить выбор' }).click()
  await expect(page.getByText('На воздушного змея хватает!', { exact: true })).toBeVisible()
})
