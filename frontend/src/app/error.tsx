'use client'

import { Button, Logo } from '@/shared/ui'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="standalone-error">
      <Logo />
      <div className="empty-state" role="alert">
        <h1>Давайте попробуем ещё раз</h1>
        <p>Не удалось показать страницу. Сохранённые на сервере записи остаются в копилке.</p>
        <Button onClick={reset}>Повторить</Button>
      </div>
    </main>
  )
}
