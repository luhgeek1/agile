import { test, expect, type Page } from '@playwright/test'

async function allocate(page: Page, amounts: number[]) {
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
  page.on('pageerror', error => errors.push(error.message))
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
  await expect(page.locator('.map-chip')).toHaveText('3 из 20 открытий')
  await expect(page.locator('#route-select')).toHaveValue('1')
  await page.getByLabel('Участок парка').selectOption('0')
  await page.locator('[data-mission="0"]').click()
  await allocate(page, [100, 0, 0])
  await page.locator('[data-choice="2"]').click()
  await page.locator('[data-action="confirm-event"]').click()
  await page.locator('[data-action="to-quiz"]').click()
  await page.locator('[data-answer="0"]').click()
  await page.locator('[data-action="finish"]').click()
  await page.locator('[data-nav="map"]').last().click()
  await expect(page.locator('.map-chip')).toHaveText('3 из 20 открытий')
  expect(errors).toEqual([])
})
