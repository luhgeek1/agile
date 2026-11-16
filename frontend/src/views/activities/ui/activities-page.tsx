'use client'

import { ActivityCard } from '@/entities/activity'
import { Button, EmptyState, Page, PageHeading } from '@/shared/ui'
import { DiscoveryHub } from '@/widgets/discovery-hub'
import { MethodNote } from '@/widgets/method-note'
import { useProduct } from '@/widgets/product-shell'
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
      <DiscoveryHub activities={state.activities} onOpen={openActivity} />
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
