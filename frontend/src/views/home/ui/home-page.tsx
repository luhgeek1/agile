'use client'

import { GoalCard } from '@/entities/goal'
import { categoryKeys, SectionCard } from '@/entities/wallet'
import { AddButton } from '@/features/record-operation'
import { money } from '@/shared/lib/money'
import { Loading, Page } from '@/shared/ui'
import { useProduct } from '@/widgets/product-shell'
import { Info } from 'lucide-react'
import { Suspense } from 'react'

import { HomeTasks } from './home-tasks'
import { RecentTransactions } from './recent-transactions'

export function HomePage() {
  const { state, add, editGoal, openActivity } = useProduct()
  const total = Object.values(state.balances).reduce((a, b) => a + b, 0)
  return (
    <Page>
      <div className="home-hero">
        <h1>Моя копилка</h1>
        <div className="home-hero-side">
          <AddButton onClick={() => add()} />
        </div>
      </div>
      <div className="home-columns">
        <div className="home-piggy-area">
          <div className="section-heading">
            <h2>Мои три отсека</h2>
            <span className="total-balance">
              Всего <strong>{money(total)}</strong>
            </span>
          </div>
          <div className="sections-grid">
            {categoryKeys.map((c) => (
              <SectionCard
                key={c}
                category={c}
                amount={state.balances[c]}
                onAdd={() => add({ category: c })}
              />
            ))}
          </div>
          <p className="physical-note">
            <Info size={15} />
            Записывай сюда, сколько положил или взял из копилки.
          </p>
        </div>
        <div className="home-goal">
          <div className="section-heading">
            <h2>Моя цель</h2>
          </div>
          <GoalCard goal={state.goal} onEdit={editGoal} />
        </div>
      </div>
      <div className="home-bottom">
        <HomeTasks activities={state.activities} onOpen={openActivity} />
        <Suspense fallback={<Loading />}>
          <RecentTransactions />
        </Suspense>
      </div>
    </Page>
  )
}
