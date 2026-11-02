'use client'

import { api, useSave } from '@/shared/api'
import { Button, Card, Confirm, FieldError, Page, PageHeading } from '@/shared/ui'
import { useProduct } from '@/widgets/product-shell'
import { Download, Info, Leaf, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function SettingsPage() {
  const { state } = useProduct()
  const reset = useSave<{ seeded: boolean }>('/demo/reset')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const exportFeedback = async () => {
    setExporting(true)
    setExportError('')
    try {
      const data = await api('/feedback/export')
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      )
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'kopilka-demo-feedback.json'
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Отзывы из этой сессии выгружены')
    } catch (e) {
      setExportError((e as Error).message)
    } finally {
      setExporting(false)
    }
  }
  const resetDemo = async (seeded: boolean) => {
    try {
      await reset.mutateAsync({ seeded })
      toast.success(
        seeded ? 'Демо снова как в первый день' : 'Чистая копилка готова к первым шагам',
      )
    } catch {
      /* shown inline */
    }
  }
  return (
    <Page>
      <PageHeading
        eyebrow="Всё под рукой"
        title="Справка и настройки"
        description="Как устроена копилка и где хранятся твои открытия."
      />
      <div className="settings-layout">
        <div>
          <Card>
            <h2>
              <Info size={23} />
              Как это работает
            </h2>
            <div className="faq">
              <details open>
                <summary>Настоящие деньги или игра?</summary>
                <p>
                  Приложение помогает вести записи о настоящей копилке. Оно не хранит деньги, не
                  принимает платежи и не переводит их. В демо используются учебные суммы.
                </p>
              </details>
              <details>
                <summary>Как меняется прогресс цели?</summary>
                <p>
                  Прогресс равен балансу отсека «Коплю», делённому на стоимость цели. Пополнение
                  увеличивает прогресс, расход или перенос из «Коплю» уменьшает его. Задания не
                  добавляют денег.
                </p>
              </details>
              <details>
                <summary>Сохранятся ли мои действия?</summary>
                <p>
                  Да, на сервере. Этот браузер хранит только cookie демо-сессии на 30 дней. Если
                  удалить cookie или открыть другой браузер, создастся отдельная демо-копилка.
                </p>
              </details>
              <details>
                <summary>Кто видит данные?</summary>
                <p>
                  Только обладатель этой демо-сессии. Не вводите настоящие данные ребёнка. Для
                  работы с реальными семьями потребуются серверная авторизация и отдельная правовая
                  проверка.
                </p>
              </details>
              <details>
                <summary>Что делать, если запись не сохранилась?</summary>
                <p>
                  Проверьте подключение и повторите действие. При повторной отправке неизменённой
                  операции сервер не начислит деньги дважды.
                </p>
              </details>
            </div>
          </Card>
          <Card className="about-card">
            <Leaf size={25} />
            <div>
              <h2>Коплю — Трачу — Помогаю</h2>
              <p>
                Образовательный прототип цифрового продолжения физической «Умной копилки» НЦФГ.
                Дизайн, тексты и механики предложены командой; окончательное согласование с НЦФГ ещё
                впереди.
              </p>
              <span className="pill">Версия 1.0 · Изолированное демо</span>
            </div>
          </Card>
        </div>
        <div>
          <Card className="demo-settings">
            <span className="tip-icon save">
              <ShieldCheck size={25} />
            </span>
            <h2>Твоё демо-пространство</h2>
            <p>
              Профиль «{state.nickname}» · {state.transaction_count} записей. Здесь можно пройти все
              сценарии и начать заново.
            </p>
            <div className="settings-action">
              <h3>Вернуть пример</h3>
              <p>Снова появятся начальные суммы, цель и первое выполненное задание.</p>
              <Confirm
                trigger={
                  <Button variant="secondary" busy={reset.isPending}>
                    <RotateCcw size={18} />
                    Сбросить демо
                  </Button>
                }
                title="Вернуть начальный пример?"
                description="Записи, цель, выполненные задания и отзывы только этой демо-сессии будут заменены начальными. Это нельзя отменить."
                onConfirm={() => {
                  void resetDemo(true)
                }}
                busy={reset.isPending}
              />
            </div>
            <div className="settings-action">
              <h3>Попробовать с нуля</h3>
              <p>Пустые отсеки, чистая история и новая мечта.</p>
              <Confirm
                trigger={
                  <Button variant="ghost" busy={reset.isPending}>
                    Начать с пустой копилкой
                  </Button>
                }
                title="Начать с чистой копилки?"
                description="Все записи, цель, отметки заданий и отзывы только этой демо-сессии будут удалены. Отменить это действие нельзя."
                onConfirm={() => {
                  void resetDemo(false)
                }}
                busy={reset.isPending}
              />
            </div>
            <FieldError message={reset.error?.message} />
          </Card>
          <Card className="export-card">
            <h2>Отзывы для проверки</h2>
            <p>
              JSON-файл с отзывами только этой демо-сессии, без идентификаторов семьи. Не публикуйте
              файл, если сами добавили в текст личные данные.
            </p>
            <Button
              variant="secondary"
              busy={exporting}
              onClick={() => {
                void exportFeedback()
              }}
            >
              <Download size={18} />
              Выгрузить отзывы
            </Button>
            <FieldError message={exportError} />
          </Card>
        </div>
      </div>
    </Page>
  )
}
