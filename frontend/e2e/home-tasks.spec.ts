import { expect, test } from '@playwright/test'

test('all home tasks open directly and completion updates the progress and next task', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Я ребёнок' }).click()
  const board = page.getByRole('region', { name: 'Выбери задание' })
  await expect(board.getByRole('button')).toHaveCount(6)
  const before = await (await page.request.get('/api/state')).json()
  const tasks = before.activities as {
    title: string
    steps: string[]
    completed_at: string | null
  }[]
  const unfinished = tasks.filter((task) => !task.completed_at)
  await expect(board.locator('.task-row-featured')).toContainText(unfinished[0].title)

  const dialog = page.getByRole('dialog')
  for (const task of tasks) {
    const opener = board.getByRole('button', { name: new RegExp(task.title) })
    await opener.focus()
    await page.keyboard.press('Enter')
    await expect(dialog.getByRole('heading', { name: task.title, exact: true })).toBeVisible()
    await expect(dialog.locator('.activity-steps > li > span:last-child')).toHaveText(task.steps)
    await page.keyboard.press('Escape')
    await expect(opener).toBeFocused()
  }

  await board.locator('.task-row-featured').click()
  await dialog.getByRole('button', { name: 'Готово!' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(board.getByRole('status')).toHaveText('Выполнено 2 из 6')
  await expect(board.getByRole('progressbar')).toHaveAttribute('value', '2')
  await expect(board.locator('.task-row-featured')).toContainText(unfinished[1].title)
  await expect(
    board.getByRole('button', { name: `Вспомнить «${unfinished[0].title}», выполнено` }),
  ).toBeVisible()
  expect((await (await page.request.get('/api/state')).json()).balances).toEqual(before.balances)
})
