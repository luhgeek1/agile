'use client'

import { ActivityCard } from '@/entities/activity'
import { Button, Card, EmptyState, Page, PageHeading, Progress } from '@/shared/ui'
import { MethodNote } from '@/widgets/method-note'
import { useProduct } from '@/widgets/product-shell'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'

export function ActivitiesPage() {
  const { state, openActivity } = useProduct()
  const [filter, setFilter] = useState('all')
  const completed = state.activities.filter((a) => a.completed_at).length
  return (
    <Page>
      <PageHeading
        eyebrow="Делаем открытия"
        title="Полезные привычки — играючи"
        description="Немного любопытства, несколько минут и кто-то рядом."
      />
      <Card className="discovery-banner">
        <span className="discovery-icon">
          <Sparkles size={35} />
        </span>
        <div>
          <h2>Твоя коллекция открытий</h2>
          <p>Здесь нет гонки. Выбирай задание по настроению.</p>
          <Progress
            value={(completed / state.activities.length) * 100}
            label="Выполненные задания"
          />
        </div>
        <strong>
          {completed}
          <span>из {state.activities.length}</span>
        </strong>
      </Card>
      <div className="filter-chips activity-filters" role="group" aria-label="Фильтр заданий">
        {[
          ['all', 'Все открытия'],
          ['new', 'Можно попробовать'],
          ['done', 'Выполнено'],
        ].map(([key, label]) => (
          <button aria-pressed={filter === key} key={key} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="activities-grid">
        {state.activities
          .filter(
            (a) => filter === 'all' || (filter === 'done' ? !!a.completed_at : !a.completed_at),
          )
          .map((a) => (
            <ActivityCard key={a.id} activity={a} onOpen={openActivity} />
          ))}
      </div>
      {filter === 'done' && completed === 0 && (
        <EmptyState
          title="Первое открытие впереди"
          description="Выбери любое задание. Можно делать его вместе со взрослым."
        >
          <Button onClick={() => setFilter('new')}>Выбрать задание</Button>
        </EmptyState>
      )}
      {filter === 'new' && completed === state.activities.length && (
        <EmptyState
          title="Все открытия с тобой!"
          description="Ты можешь повторить любое задание или придумать своё вместе со взрослым."
        >
          <Button onClick={() => setFilter('all')}>Все задания</Button>
        </EmptyState>
      )}
      <MethodNote />
    </Page>
  )
}
