'use client'

import { ActivityCard } from '@/entities/activity'
import { Button, EmptyState, Page, PageHeading, SegmentedControl } from '@/shared/ui'
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
      <PageHeading title="Задания" description="Выбери, что попробовать дома." />
      <div className="activity-filters" ref={filters}>
        <SegmentedControl
          label="Фильтр заданий"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Все задания' },
            { value: 'new', label: 'Новые' },
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
        <EmptyState title="Выполненных заданий пока нет" description="Выбери, с чего начать.">
          <Button onClick={() => setFilter('new')}>Выбрать задание</Button>
        </EmptyState>
      )}
      {filter === 'new' && completed === state.activities.length && (
        <EmptyState title="Все задания с тобой!" description="Можно повторить любимое.">
          <Button onClick={() => setFilter('all')}>Все задания</Button>
        </EmptyState>
      )}
    </Page>
  )
}
