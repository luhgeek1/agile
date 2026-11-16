'use client'

import { ActivityCard } from '@/entities/activity'
import { Button, EmptyState, Page, PageHeading, SegmentedControl } from '@/shared/ui'
import { DiscoveryHub } from '@/widgets/discovery-hub'
import { MethodNote } from '@/widgets/method-note'
import { useProduct } from '@/widgets/product-shell'
import { useRef, useState } from 'react'
import { motion } from 'motion/react'

export function ActivitiesPage() {
  const { state, openActivity } = useProduct()
  const [filter, setFilter] = useState('all')
  const filters = useRef<HTMLDivElement>(null)
  const completed = state.activities.filter((a) => a.completed_at).length
  return (
    <Page className="activities-page">
      <PageHeading
        eyebrow="Делаем открытия"
        title="Полезные привычки — играючи"
        description="Немного любопытства, несколько минут и кто-то рядом."
      />
      <DiscoveryHub activities={state.activities} onOpen={openActivity} />
      <div className="activity-list-heading">
        <h2>Что попробуем сегодня?</h2>
        <span aria-live="polite">
          Открыто {completed} из {state.activities.length}
        </span>
      </div>
      <div className="activity-filters" ref={filters}>
        <SegmentedControl
          label="Фильтр заданий"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Все открытия' },
            { value: 'new', label: 'Можно попробовать' },
            { value: 'done', label: 'Выполнено' },
          ]}
        />
      </div>
      <div className="activities-grid">
        {state.activities
          .filter(
            (a) => filter === 'all' || (filter === 'done' ? !!a.completed_at : !a.completed_at),
          )
          .map((a) => (
            <motion.div
              key={a.id}
              layout="position"
              initial={false}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            >
              <ActivityCard
                activity={a}
                onOpen={(activity) =>
                  openActivity(
                    activity,
                    filters.current?.querySelector<HTMLButtonElement>('[aria-pressed=true]'),
                  )
                }
              />
            </motion.div>
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
