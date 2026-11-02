'use client'

import { GoalCard } from '@/entities/goal'
import { Card, Page, PageHeading } from '@/shared/ui'
import { useProduct } from '@/widgets/product-shell'
import { Heart, Sprout } from 'lucide-react'

export function GoalsPage() {
  const { state, add, editGoal } = useProduct()
  return (
    <Page>
      <PageHeading
        eyebrow="Шаг за шагом"
        title="У меня есть мечта"
        description="Большая или маленькая — главное, что она твоя."
      />
      <div className="goals-layout">
        <GoalCard
          goal={state.goal}
          onEdit={editGoal}
          large
          onAdd={() => add({ category: 'save' })}
        />
        <div className="goal-aside">
          <Card>
            <span className="tip-icon save">
              <Sprout size={25} />
            </span>
            <h2>Как растёт мечта?</h2>
            <ol className="steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Выбери то, что важно тебе</strong>
                  <p>Узнай стоимость вместе со взрослым.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Добавляй в «Коплю»</strong>
                  <p>Любая сумма — уже маленький шаг.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Замечай свой прогресс</strong>
                  <p>Здесь видны деньги, которые ты записал.</p>
                </div>
              </li>
            </ol>
          </Card>
          <div className="soft-note">
            <Heart size={21} />
            <p>Можно передумать и выбрать новую цель. Мечты меняются — и это нормально.</p>
          </div>
        </div>
      </div>
    </Page>
  )
}
