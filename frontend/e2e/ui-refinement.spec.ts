import { expect, test, type Page } from '@playwright/test'

async function enter(page: Page, path: string) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.goto(path)
  await expect(page.locator('main h1')).toBeVisible()
}

test('journal merges a date across pages, keeps years distinct and ignores stale filters', async ({
  page,
}) => {
  const records = Array.from({ length: 32 }, (_, index) => ({
    id: String(index),
    kind: 'deposit',
    category: index % 2 ? 'save' : 'help',
    destination: null,
    amount: 12500,
    note: `Запись №${index + 1}`,
    occurred_on: index < 31 ? '2026-11-15' : '2025-11-15',
    created_at: '2026-11-16T00:00:00Z',
  }))
  await page.route('**/api/transactions?*', async (route) => {
    const params = new URL(route.request().url()).searchParams
    const category = params.get('category')
    const offset = Number(params.get('offset') ?? 0)
    const selected = records.filter((item) => !category || item.category === category)
    if (category)
      await new Promise((resolve) => setTimeout(resolve, category === 'save' ? 1200 : 80))
    await route.fulfill({
      json: { items: selected.slice(offset, offset + 30), has_more: offset + 30 < selected.length },
    })
  })
  await enter(page, '/app/transactions')
  await expect(page.locator('.history-day')).toHaveCount(1)
  await expect(page.locator('.transaction-item')).toHaveCount(30)
  await page.getByRole('button', { name: 'Показать ещё' }).click()
  await expect(page.locator('.transaction-item')).toHaveCount(32)
  await expect(page.locator('.history-day')).toHaveCount(2)
  await expect(page.locator('.history-day').first().locator('li')).toHaveCount(31)
  await expect(page.locator('time[datetime="2025-11-15"]')).toContainText('2025')
  await page.getByRole('button', { name: 'Коплю', exact: true }).click()
  await expect(page.locator('.history-results')).toHaveAttribute('aria-busy', 'true')
  await expect(page.locator('.transaction-item')).toHaveCount(32)
  await page.getByRole('button', { name: 'Помогаю', exact: true }).click()
  await expect(page.locator('.history-results')).toHaveAttribute('aria-busy', 'false')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.transaction-item')).toHaveCount(16)
  await expect(page.locator('.transaction-icon.save')).toHaveCount(0)
  await expect(page.locator('.history-caption')).toContainText('Показано записей: 16')
})

test('activity filters remain usable through completion and repeated switching', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await enter(page, '/app/activities')
  const filters = page.getByRole('group', { name: 'Фильтр заданий' })
  await filters.getByRole('button', { name: 'Можно попробовать' }).click()
  await expect(page.locator('.activities-grid .activity-card')).toHaveCount(5)
  await page
    .locator('.activities-grid')
    .getByRole('button', { name: 'Попробовать' })
    .first()
    .focus()
  await page.keyboard.press('Enter')
  await page.getByRole('dialog').getByRole('button', { name: 'Я попробовал!' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.locator('.activities-grid .activity-card')).toHaveCount(4)
  await expect(page.locator('.activity-list-heading')).toContainText('Открыто 2 из 6')
  await expect(filters.getByRole('button', { name: 'Можно попробовать' })).toBeFocused()
  await filters.getByRole('button', { name: 'Выполнено', exact: true }).click()
  await expect(page.locator('.activities-grid .activity-card')).toHaveCount(2)
  await filters.getByRole('button', { name: 'Все открытия' }).click()
  await filters.getByRole('button', { name: 'Можно попробовать' }).click()
  await filters.getByRole('button', { name: 'Все открытия' }).click()
  await expect(page.locator('.activities-grid .activity-card')).toHaveCount(6)
  const opener = page
    .locator('.activities-grid')
    .getByRole('button', { name: 'Вспомнить задание' })
    .first()
  await opener.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Escape')
  await expect(opener).toBeFocused()
})

test('long goals, reduced motion and 200% CSS zoom remain readable on a narrow screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await enter(page, '/app/goals')
  await page.getByRole('button', { name: 'Редактировать цель' }).click()
  const dialog = page.getByRole('dialog')
  const title = 'Большой набор для рисования и самостоятельных открытий'
  await dialog.getByRole('textbox', { name: 'Моя мечта', exact: true }).fill(title)
  await dialog.getByLabel('Сколько нужно рублей?', { exact: false }).fill('999999')
  await dialog.getByRole('button', { name: 'Сохранить цель' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await expect(page.locator('.page')).toHaveCSS('animation-name', 'none')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.setViewportSize({ width: 640, height: 900 })
  await page.addStyleTag({ content: 'html { zoom: 2; }' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.getByRole('button', { name: 'Изменить цель', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(dialog).toHaveCSS('animation-name', 'none')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Изменить цель', exact: true })).toBeFocused()
})

for (const width of [390, 640, 1440]) {
  test(`notifications leave navigation usable and dismissible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await enter(page, '/app/goals')
    await page.getByRole('button', { name: 'Добавить в «Коплю»', exact: true }).click()
    await page.getByRole('dialog').getByLabel('Сколько рублей?', { exact: false }).fill('1')
    await page.getByRole('button', { name: 'Сохранить действие' }).click()
    const toast = page.locator('[data-sonner-toast][data-type=success]')
    await expect(toast).toBeVisible()
    await expect(toast).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    const nav = page.getByRole('navigation', {
      name: width < 768 ? 'Навигация на телефоне' : 'Основная навигация',
    })
    const navBounds = await nav.boundingBox()
    await expect
      .poll(async () => {
        const bounds = await toast.boundingBox()
        return bounds ? bounds.y + bounds.height : Infinity
      })
      .toBeLessThanOrEqual(width < 768 ? navBounds!.y - 8 : 888)
    await nav.getByRole('link', { name: 'История', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'История копилки' })).toBeVisible()
    const close = page.getByRole('button', { name: 'Закрыть уведомление' })
    const closeBounds = await close.boundingBox()
    expect(closeBounds!.width).toBeGreaterThanOrEqual(43.99)
    expect(closeBounds!.height).toBeGreaterThanOrEqual(43.99)
    await close.click()
    await expect(toast).not.toBeVisible()
  })
}
