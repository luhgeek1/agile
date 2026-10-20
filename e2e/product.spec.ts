import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function enter(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
}
async function finishAnimation(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.page')).toHaveCSS('opacity', '1')
}
test('whole journey: deposit, reload, edit goal, and history filters', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await enter(page)
  await page.getByRole('button', { name: 'Добавить действие', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Сколько рублей?', { exact: false }).fill('150')
  await dialog.getByLabel('Заметка', { exact: false }).fill('Проверка пополнения')
  await dialog.getByRole('button', { name: 'Сохранить действие' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByTestId('balance-save')).toHaveText(/1\s400\s₽/)
  await page.reload()
  await expect(page.getByTestId('balance-save')).toHaveText(/1\s400\s₽/)
  await page.goto('/app/goals')
  await page.getByRole('button', { name: 'Редактировать цель' }).click()
  await page
    .getByRole('dialog')
    .getByRole('textbox', { name: 'Моя мечта', exact: true })
    .fill('Новый набор для рисования')
  await page.getByRole('dialog').getByLabel('Сколько нужно рублей?', { exact: false }).fill('2000')
  await page.getByRole('button', { name: 'Книга', exact: true }).click()
  await page.getByRole('button', { name: 'Сохранить цель', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Новый набор для рисования' })).toBeVisible()
  await expect(
    page.getByRole('progressbar', { name: 'Прогресс накопительной цели' }),
  ).toHaveAttribute('aria-valuenow', '70')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Новый набор для рисования' })).toBeVisible()
  await page.goto('/app/transactions')
  await page.getByRole('button', { name: 'Коплю', exact: true }).click()
  await page.getByLabel('Тип операции').selectOption('deposit')
  await expect(page.getByText('Проверка пополнения', { exact: true })).toBeVisible()
  await expect(page.getByText('Набор цветных карандашей', { exact: true })).not.toBeVisible()
  await page.goBack()
  expect(errors).toEqual([])
})

test('form validation, overdraft prevention, transfer and help expense', async ({ page }) => {
  await enter(page)
  await page.getByRole('button', { name: 'Добавить действие', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('tab', { name: 'Использовал' }).click()
  await dialog.getByLabel('Сколько рублей?', { exact: false }).fill('0')
  await dialog.getByRole('button', { name: 'Сохранить действие' }).click()
  await expect(dialog.getByText('Введите от 0,01', { exact: false })).toBeVisible()
  await dialog.getByLabel('Сколько рублей?', { exact: false }).fill('2000')
  await dialog.getByRole('button', { name: 'Сохранить действие' }).click()
  await expect(dialog.getByText('В этом отсеке не хватает денег.', { exact: false })).toBeVisible()
  await page.screenshot({ path: 'artifacts/qa/operation-error.png' })
  await dialog.getByRole('tab', { name: 'Перенёс' }).click()
  await dialog.getByLabel('Сколько рублей?', { exact: false }).fill('100')
  await dialog.getByLabel('В какой отсек?').selectOption('help')
  await dialog.getByRole('button', { name: 'Сохранить действие' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByTestId('balance-save')).toHaveText(/1\s150\s₽/)
  await expect(page.getByTestId('balance-help')).toHaveText(/300\s₽/)
  await page.getByRole('button', { name: 'Добавить деньги в «Помогаю»' }).click()
  await page.getByRole('tab', { name: 'Использовал' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '50 ₽', exact: true }).click()
  await page.getByRole('button', { name: 'Сохранить действие' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByTestId('balance-help')).toHaveText(/250\s₽/)
})

test('activities, parent progress, feedback validation, persistence, export', async ({ page }) => {
  await enter(page)
  const before = await (await page.request.get('/api/state')).json()
  await page.goto('/app/activities')
  const task = page
    .locator('.activity-card')
    .filter({ has: page.getByRole('heading', { name: 'Добро без монет' }) })
  await task.getByRole('button', { name: 'Попробовать' }).click()
  await page.getByRole('button', { name: 'Я попробовал!' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.reload()
  await expect(task.getByText('Выполнено', { exact: true })).toBeVisible()
  expect((await (await page.request.get('/api/state')).json()).balances).toEqual(before.balances)
  await page.goto('/app/parent')
  await expect(page.getByRole('heading', { name: 'О чём поговорить сегодня' })).toBeVisible()
  await expect(
    page.locator('.completed-list').getByRole('button', { name: /Добро без монет/ }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Оставить отзыв' }).click()
  await page.getByRole('button', { name: 'Сохранить отзыв' }).click()
  await expect(page.getByText('Выберите оценку от 1 до 5')).toBeVisible()
  await page.getByRole('radio', { name: '5', exact: true }).check()
  await page.getByRole('radio', { name: 'Всё понятно', exact: true }).check()
  await page
    .getByLabel('Что помогло или чего не хватило?', { exact: false })
    .fill('Понятные три отсека')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Сохранить отзыв' }).click()
  await expect(page.getByRole('heading', { name: 'Спасибо, что поделились!' })).toBeVisible()
  const records = await (await page.request.get('/api/feedback/export')).json()
  expect(records.items[0].comment).toBe('Понятные три отсека')
  await page.goto('/app/settings')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Выгрузить отзывы' }).click()
  expect((await download).suggestedFilename()).toBe('kopilka-demo-feedback.json')
})

test('safe reset, empty states, goal creation and achieved state', async ({ page }) => {
  await enter(page)
  await page.goto('/app/settings')
  await page.getByRole('button', { name: 'Начать с пустой копилкой' }).click()
  await page.getByRole('button', { name: 'Отмена', exact: true }).click()
  expect((await (await page.request.get('/api/state')).json()).transaction_count).toBe(6)
  await page.getByRole('button', { name: 'Начать с пустой копилкой' }).click()
  await page.getByRole('button', { name: 'Да, сбросить' }).click()
  await expect(page.getByText('Профиль «Саша» · 0 записей.', { exact: false })).toBeVisible()
  await page.goto('/app/transactions')
  await expect(page.getByRole('heading', { name: 'Здесь пока тихо' })).toBeVisible()
  await page.goto('/app/goals')
  await page.getByRole('button', { name: 'Создать цель' }).click()
  await page.getByRole('button', { name: 'Сохранить цель', exact: true }).click()
  await expect(page.getByText('Напиши хотя бы 2 символа')).toBeVisible()
  await page.getByRole('textbox', { name: /^Моя мечта/ }).fill('Моя книга')
  await page.getByLabel('Сколько нужно рублей?', { exact: false }).fill('1000')
  await page.getByRole('button', { name: 'Сохранить цель', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Моя книга', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Добавить в «Коплю»' }).click()
  await page.getByLabel('Сколько рублей?', { exact: false }).fill('1000')
  await page.getByRole('button', { name: 'Сохранить действие' }).click()
  await expect(page.getByText('Получилось! Обсуди покупку со взрослым.')).toBeVisible()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  await page.goto('/app/settings')
  await page.getByRole('button', { name: 'Сбросить демо', exact: true }).click()
  await page.getByRole('button', { name: 'Да, сбросить' }).click()
  await expect(page.getByText('Профиль «Саша» · 6 записей.', { exact: false })).toBeVisible()
})

test('API outage, error retry, expired session, unknown route', async ({ page }) => {
  await enter(page)
  await page.route('**/api/state', (route) => route.abort())
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Копилка пока не отвечает' })).toBeVisible()
  await page.unroute('**/api/state')
  await page.getByRole('button', { name: 'Повторить', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
  await page.goto('/app/unknown')
  await expect(page.getByRole('heading', { name: 'Здесь пока нет странички' })).toBeVisible()
  await page.getByRole('link', { name: 'К моей копилке' }).click()
  await expect(page.getByTestId('balance-save')).toBeVisible()
  await page.context().clearCookies()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Посмотреть демо' })).toBeVisible()
})

for (const width of [360, 390, 430, 768, 1024, 1440]) {
  test(`responsive ${width}: all routes, dialog, navigation, reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    const networkErrors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('response', (response) => {
      if (response.status() >= 400) networkErrors.push(`${response.status()} ${response.url()}`)
    })
    await enter(page)
    for (const path of [
      '/app',
      '/app/goals',
      '/app/transactions',
      '/app/activities',
      '/app/parent',
      '/app/parent/feedback',
      '/app/settings',
    ]) {
      await page.goto(path)
      await expect(page.locator('main h1')).toBeVisible()
      await finishAnimation(page)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${path} overflows at ${width}`,
      ).toBeTruthy()
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: `artifacts/qa/${path.replaceAll('/', '-').slice(1)}-${width}.png`,
          fullPage: true,
        })
    }
    await page.goto('/app')
    await page.getByRole('button', { name: 'Добавить действие', exact: true }).click()
    await finishAnimation(page)
    const dialog = page.getByRole('dialog')
    const bounds = await dialog.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1)
    expect(bounds!.y).toBeGreaterThanOrEqual(0)
    await dialog.getByLabel('Сколько рублей?', { exact: false }).fill('999999,99')
    await dialog.getByRole('button', { name: 'Сохранить действие' }).click()
    await expect(dialog).not.toBeVisible()
    await finishAnimation(page)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy()
    if (width < 768) {
      const nav = page.getByRole('navigation', { name: 'Навигация на телефоне' })
      await expect(nav).toBeVisible()
      await nav.getByRole('link', { name: 'Задания' }).click()
      await expect(page).toHaveURL(/activities/)
    }
    expect(errors).toEqual([])
    expect(networkErrors).toEqual([])
  })
}

test('new browser session never reuses the previous family query cache', async ({ page }) => {
  await enter(page)
  await page.getByRole('button', { name: 'Добавить действие', exact: true }).click()
  await page.getByLabel('Сколько рублей?', { exact: false }).fill('150')
  await page.getByRole('button', { name: 'Сохранить действие' }).click()
  await expect(page.getByTestId('balance-save')).toHaveText(/1\s400\s₽/)
  await page.context().clearCookies()
  await page.goBack()
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  await expect(page.getByTestId('balance-save')).toHaveText(/1\s250\s₽/)
})

test('keyboard: dialog trap, Escape, navigation and restore focus', async ({ page }) => {
  await enter(page)
  const opener = page.getByRole('button', { name: 'Добавить действие', exact: true })
  await opener.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab')
    expect(
      await page.getByRole('dialog').evaluate((el) => el.contains(document.activeElement)),
    ).toBeTruthy()
  }
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(opener).toBeFocused()
})

for (const width of [390, 1440]) {
  test(`accessibility ${width}: WCAG A/AA pages and operation dialog`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await finishAnimation(page)
    let result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(result.violations).toEqual([])
    await page.getByRole('button', { name: 'Посмотреть демо' }).click()
    await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
    for (const path of [
      '/app',
      '/app/goals',
      '/app/transactions',
      '/app/activities',
      '/app/parent',
      '/app/parent/feedback',
      '/app/settings',
    ]) {
      await page.goto(path)
      await expect(page.locator('main h1')).toBeVisible()
      await finishAnimation(page)
      result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(result.violations, `${path} at ${width}`).toEqual([])
    }
    await page.goto('/app')
    await page.getByRole('button', { name: 'Добавить действие', exact: true }).click()
    result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(result.violations).toEqual([])
  })
}
