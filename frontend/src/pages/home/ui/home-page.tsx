import { GoalCard } from '@/entities/goal'
import { TransactionItem } from '@/entities/transaction'
import { categoryKeys, SectionCard } from '@/entities/wallet'
import { AddButton } from '@/features/record-operation'
import { money } from '@/shared/lib/money'
import { Button, Card, EmptyState, Page } from '@/shared/ui'
import { ActivityCarousel } from '@/widgets/activity-carousel'
import { useProduct } from '@/widgets/product-shell'
import { ArrowRight, ArrowUpRight, Heart, History, Info, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  const { state, add, editGoal, openActivity } = useProduct()
  const total = Object.values(state.balances).reduce((a, b) => a + b, 0)
  return (
    <Page>
      <div className="home-hero">
        <div>
          <div className="greeting">
            <span className="greeting-sun" aria-hidden="true">
              ✳
            </span>
            Привет, {state.nickname}!
          </div>
          <h1>
            У каждой мечты
            <br />
            есть <span>своя копилка.</span>
          </h1>
          <p>Копи, выбирай, помогай. Что сделаем сегодня?</p>
        </div>
        <div className="home-hero-side">
          <span className="handwritten">
            Большое начинается
            <br />с маленького!
          </span>
          <svg viewBox="0 0 110 52" aria-hidden="true">
            <path
              d="M8 4q-4 28 77 25m-15-11 16 11-14 12"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
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
            Это твои записи. Настоящие монетки живут в настоящей копилке.
          </p>
        </div>
        <div className="home-goal">
          <GoalCard goal={state.goal} onEdit={editGoal} />
        </div>
      </div>
      <div className="home-bottom">
        <section className="home-task">
          <div className="section-heading">
            <h2>
              <Sparkles size={21} />
              Выбери задание
            </h2>
            <Link className="text-link" to="/app/activities">
              Все задания
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <ActivityCarousel activities={state.activities} onOpen={openActivity} />
        </section>
        <section className="home-recent">
          <div className="section-heading">
            <h2>
              <History size={21} />
              Последние шаги
            </h2>
          </div>
          <Card className="recent-card">
            {state.recent_transactions.length ? (
              <ul>
                {state.recent_transactions.map((t) => (
                  <TransactionItem key={t.id} item={t} />
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Твоя история начинается"
                description="Запиши первое действие с копилкой."
              >
                <Button onClick={() => add()}>Добавить действие</Button>
              </EmptyState>
            )}
          </Card>
          <Link className="text-link recent-history-link" to="/app/transactions">
            Посмотреть всю историю
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
      <div className="together-note">
        <Heart size={20} />
        <p>Мечтать интереснее вместе. Позови взрослого — у него тоже есть своя страничка.</p>
        <Link to="/app/parent">
          Родителям
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </Page>
  )
}
