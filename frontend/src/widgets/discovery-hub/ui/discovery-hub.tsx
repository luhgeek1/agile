import type { Activity } from '@/shared/api/contracts'
import { categories, categoryKeys, CategoryIcon } from '@/entities/wallet'
import { Button, Card, Progress } from '@/shared/ui'
import { ArrowUpRight, Check } from 'lucide-react'
import { ParkScene } from './park-scene'

export function DiscoveryHub({ activities, onOpen }: {
  activities: Activity[]
  onOpen: (activity: Activity) => void
}) {
  return (
    <div className="discovery-hub">
      <Card className="park-invitation">
        <div className="park-invitation-copy">
          <span className="eyebrow">Приключение на 3–5 минут</span>
          <h2>Парк маленьких открытий</h2>
          <p>Построй план мечты, собери пикник и помоги саду. Открывай значки и тренируйся выбирать.</p>
          <Button asChild><a href="/game/index.html">Отправиться в парк <ArrowUpRight size={18} /></a></Button>
          <small>Игровые монеты не меняют копилку. Прогресс игры хранится в этом браузере.</small>
        </div>
        <ParkScene />
      </Card>
      <section className="habit-collection" aria-labelledby="habit-collection-title">
        <h2 id="habit-collection-title">Открытия с настоящей копилкой</h2>
        <p>Попробуй два дела в каждой теме. Твои открытия сохраняются в профиле, без сроков и гонки.</p>
        <div className="habit-trails">
          {categoryKeys.map(category => {
            const tasks = activities.filter(activity => activity.category === category)
            const done = tasks.filter(activity => activity.completed_at).length
            const next = tasks.find(activity => !activity.completed_at) ?? tasks.at(-1)
            const earned = tasks.length > 0 && done === tasks.length
            return (
              <button key={category} className={`habit-trail ${category}`} disabled={!next}
                onClick={() => next && onOpen(next)}
                aria-label={`${categories[category].title}: ${done} из ${tasks.length}. ${earned ? 'Вспомнить задание' : 'Продолжить'}`}>
                <span className="habit-trail-title"><CategoryIcon category={category} size={24} />
                  <strong>{categories[category].title}</strong><span>{done} / {tasks.length}</span></span>
                <Progress value={tasks.length ? done / tasks.length * 100 : 0} label={`Открытия: ${categories[category].title}`} />
                <span className="habit-trail-next">{earned ? <><Check size={16} /> Тема исследована</> : next?.title ?? 'Новые дела появятся позже'}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
