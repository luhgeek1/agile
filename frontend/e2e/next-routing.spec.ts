import { test, expect } from '@playwright/test'

test('welcome is rendered on the server with Russian metadata and local fonts', async ({
  browser,
  request,
}) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('<html lang="ru"')
  expect(html).toContain('У мечты есть своя копилка.')
  expect(html).toContain('name="description"')
  expect(html).toContain('/_next/')
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'У мечты есть своя копилка.' })).toBeVisible()
  await context.close()
})

test('Next navigation preserves the document, updates titles and restores URL filters', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
  await page.evaluate(() => {
    document.documentElement.dataset.navigationProbe = 'same-document'
  })
  await page
    .getByRole('navigation', { name: 'Основная навигация' })
    .getByRole('link', { name: 'Моя цель' })
    .click()
  await expect(page.getByRole('heading', { name: 'У меня есть мечта' })).toBeVisible()
  await expect(page).toHaveTitle('Моя цель · Коплю — Трачу — Помогаю')
  expect(await page.evaluate(() => document.documentElement.dataset.navigationProbe)).toBe(
    'same-document',
  )
  await page
    .getByRole('navigation', { name: 'Основная навигация' })
    .getByRole('link', { name: 'История' })
    .click()
  await expect(page).toHaveURL(/\/app\/transactions$/)
  await page.getByRole('button', { name: 'Коплю', exact: true }).click()
  await expect(page).toHaveURL(/category=save/)
  await page.getByLabel('Тип операции').selectOption('deposit')
  await expect(page).toHaveURL(/category=save&kind=deposit/)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Коплю', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByLabel('Тип операции')).toHaveValue('deposit')
  await page.goBack()
  await expect(page.getByLabel('Тип операции')).toHaveValue('')
  expect(errors).toEqual([])
})

test('dismissed demo notice survives hydration and reload without React errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Посмотреть демо' }).click()
  await page.getByRole('button', { name: 'Закрыть сообщение о демо-пространстве' }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Мои три отсека' })).toBeVisible()
  await expect(page.locator('.demo-strip')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('health endpoint responds independently and unknown URLs return HTTP 404', async ({
  request,
}) => {
  const health = await request.get('/healthz')
  expect(health.status()).toBe(200)
  expect(await health.text()).toBe('ok')
  for (const path of ['/unknown', '/app/unknown']) {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(await response.text()).toContain('Здесь пока нет странички')
  }
})
