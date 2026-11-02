'use client'

import { TransactionItem } from '@/entities/transaction'
import { BalanceStrip } from '@/entities/wallet'
import { dateLabel, money } from '@/shared/lib/money'
import { Button, Card, Page, PageHeading, Progress } from '@/shared/ui'
import { MethodNote } from '@/widgets/method-note'
import { useProduct } from '@/widgets/product-shell'
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  History,
  MessageCircle,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import Link from 'next/link'

export function ParentPage() {
  const { state, editGoal, openActivity } = useProduct()
  const completed = state.activities.filter((a) => a.completed_at)
  return (
    <Page className="parent-page">
      <PageHeading
        eyebrow="Родительское пространство"
        title="Рядом с каждым открытием"
        description="Помогайте замечать маленькие шаги. Большие разговоры начинаются с них."
        action={
          <span className="parent-mode">
            <Users size={18} />
            Режим родителя · демо
          </span>
        }
      />
      <div className="parent-intro">
        <ShieldCheck size={22} />
        <p>
          Вы смотрите данные демо-профиля «{state.nickname}». Это отдельная зона интерфейса, без
          защиты PIN-кодом. Ввод реальных данных детей здесь не предусмотрен.
        </p>
      </div>
      <BalanceStrip state={state} />
      <div className="parent-stats">
        <Card>
          <History size={23} />
          <strong>{state.transaction_count}</strong>
          <span>записей о деньгах</span>
        </Card>
        <Card>
          <CheckCircle2 size={23} />
          <strong>
            {completed.length} из {state.activities.length}
          </strong>
          <span>выполненных заданий</span>
        </Card>
        <Card>
          <Target size={23} />
          <strong>{state.goal?.progress ?? 0}%</strong>
          <span>пути к текущей цели</span>
        </Card>
      </div>
      <p className="small-note">
        По записям вашей демо-семьи. Это не оценка финансового поведения ребёнка.
      </p>
      <div className="parent-columns">
        <Card>
          <div className="section-heading">
            <h2>Последние действия</h2>
            <Link className="text-link" href="/app/transactions">
              История
              <ArrowUpRight size={17} />
            </Link>
          </div>
          {state.recent_transactions.length ? (
            <ul>
              {state.recent_transactions.map((t) => (
                <TransactionItem key={t.id} item={t} />
              ))}
            </ul>
          ) : (
            <p className="muted">Пока нет записей. Первое действие можно добавить в копилке.</p>
          )}
        </Card>
        <div className="parent-summary">
          <Card>
            <span className="eyebrow">
              <Target size={16} />
              Текущая цель
            </span>
            <h2>{state.goal?.title ?? 'Мечта ещё не выбрана'}</h2>
            <p>
              {state.goal
                ? `${money(state.goal.saved)} из ${money(state.goal.target)}`
                : 'Помогите ребёнку выбрать то, что ему интересно.'}
            </p>
            <Progress value={state.goal?.progress ?? 0} label="Прогресс цели ребёнка" />
            <Button variant="secondary" onClick={editGoal}>
              Настроить цель вместе
            </Button>
          </Card>
          <Card>
            <h2>Уже попробовали</h2>
            {completed.length ? (
              <ul className="completed-list">
                {completed.map((a) => (
                  <li key={a.id}>
                    <CheckCircle2 size={19} />
                    <button onClick={() => openActivity(a)}>
                      {a.title}
                      <small>{dateLabel(a.completed_at!)}</small>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Открытия впереди. Начните с любого задания.</p>
            )}
            <Link className="text-link" href="/app/activities">
              Все задания
              <ArrowUpRight size={17} />
            </Link>
          </Card>
        </div>
      </div>
      <div className="section-heading material-heading">
        <h2>
          <BookOpen size={23} />О чём поговорить сегодня
        </h2>
        <span className="pill">Для взрослого и ребёнка</span>
      </div>
      <div className="materials-grid">
        {state.materials.map((m, i) => (
          <Card key={m.title}>
            <span className="material-number">0{i + 1}</span>
            <h3>{m.title}</h3>
            <p>{m.body}</p>
          </Card>
        ))}
      </div>
      <MethodNote />
      <div className="feedback-banner">
        <span className="tip-icon spend">
          <MessageCircle size={26} />
        </span>
        <div>
          <h2>Как вашей семье с копилкой?</h2>
          <p>Поделитесь впечатлением: что помогает, а что можно улучшить.</p>
        </div>
        <Button asChild>
          <Link href="/app/parent/feedback">
            Оставить отзыв
            <ArrowUpRight size={18} />
          </Link>
        </Button>
      </div>
    </Page>
  )
}
