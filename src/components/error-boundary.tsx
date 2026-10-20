import { Component, type ErrorInfo, type PropsWithChildren } from 'react'
import { Button } from './ui'
import { Logo } from './illustrations'

export class ErrorBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ошибка интерфейса копилки', error, info.componentStack)
  }
  render() {
    if (this.state.failed)
      return (
        <main className="standalone-error">
          <Logo />
          <div className="empty-state" role="alert">
            <h1>Давайте попробуем ещё раз</h1>
            <p>Не удалось показать страницу. Сохранённые на сервере записи остаются в копилке.</p>
            <Button onClick={() => window.location.reload()}>Перезагрузить страницу</Button>
          </div>
        </main>
      )
    return this.props.children
  }
}
