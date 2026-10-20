import { Link } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ArrowUpRight as Arrow,
  Target,
  Clock3,
  Check,
  Heart,
  PiggyBank,
  ShoppingBag,
  Pencil,
  Trophy,
  Sprout,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  categories,
  type Activity,
  type AppState,
  type Category,
  type Goal,
  type Transaction,
} from '../lib/types'
import { dateLabel, money } from '../lib/money'
import { useSave } from '../lib/api'
import { Button, Card, FieldError, Progress } from './ui'
import { GoalArt, Jar } from './illustrations'

export const CategoryIcon = ({ category, size = 22 }: { category: Category; size?: number }) => {
  const Icon = { save: PiggyBank, spend: ShoppingBag, help: Heart }[category]
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}
export function SectionCard({
  category,
  amount,
  onAdd,
}: {
  category: Category
  amount: number
  onAdd: () => void
}) {
  return (
    <Card className={`section-card ${category}`}>
      <div className="section-topline">
        <span className="section-icon">
          <CategoryIcon category={category} />
        </span>
        <span className="section-kicker">{categories[category].short}</span>
      </div>
      <Jar category={category} />
      <h2>{categories[category].title}</h2>
      <p className="section-description">
        <span className="description-full">{categories[category].description}</span>
        <span className="description-short">{categories[category].short}</span>
      </p>
      <div className="section-bottom">
        <strong data-testid={`balance-${category}`}>{money(amount)}</strong>
        <button
          className="section-add"
          aria-label={`Добавить деньги в «${categories[category].title}»`}
          onClick={onAdd}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
      <Link to={`/app/transactions?category=${category}`} className="category-history">
        История отсека <Arrow size={15} />
      </Link>
    </Card>
  )
}
export function GoalCard({
  goal,
  onEdit,
  large = false,
  onAdd,
}: {
  goal: Goal | null
  onEdit: () => void
  large?: boolean
  onAdd?: () => void
}) {
  if (!goal)
    return (
      <Card className="goal-card no-goal">
        <GoalArt kind="star" />
        <h2>У каждой мечты есть начало</h2>
        <p>Придумай свою первую цель вместе со взрослым.</p>
        <Button onClick={onEdit}>
          <Target size={18} />
          Создать цель
        </Button>
      </Card>
    )
  return (
    <Card className={`goal-card ${large ? 'goal-large' : ''}`}>
      <div className="goal-card-heading">
        <span className="eyebrow">
          <Target size={16} />
          Моя большая маленькая мечта
        </span>
        <button className="icon-button" aria-label="Редактировать цель" onClick={onEdit}>
          <Pencil size={18} />
        </button>
      </div>
      <GoalArt kind={goal.illustration} />
      <div className="goal-copy">
        <h2>{goal.title}</h2>
        <div className="goal-amount">
          <strong>{money(goal.saved)}</strong>
          <span>из {money(goal.target)}</span>
        </div>
        <Progress value={goal.progress} label="Прогресс накопительной цели" />
        <div className="progress-caption">
          <span>{goal.achieved ? 'Мечта стала ближе!' : `Осталось ${money(goal.remaining)}`}</span>
          <strong>{goal.progress}%</strong>
        </div>
        {goal.achieved ? (
          <p className="goal-success">
            <Trophy size={20} />
            Получилось! Обсуди покупку со взрослым.
          </p>
        ) : (
          <p className="goal-encouragement">Каждая монетка приближает к мечте.</p>
        )}
        {large ? (
          <div className="button-row">
            <Button onClick={onAdd}>Добавить в «Коплю»</Button>
            <Button variant="secondary" onClick={onEdit}>
              Изменить цель
            </Button>
          </div>
        ) : (
          <Link className="text-link" to="/app/goals">
            К моей мечте <Arrow size={17} />
          </Link>
        )}
      </div>
    </Card>
  )
}
export function TransactionItem({ item }: { item: Transaction }) {
  const Icon =
    item.kind === 'deposit'
      ? ArrowDownLeft
      : item.kind === 'transfer'
        ? ArrowLeftRight
        : ArrowUpRight
  const title =
    item.kind === 'deposit'
      ? 'Пополнение'
      : item.kind === 'transfer'
        ? 'Перенос'
        : item.category === 'help'
          ? 'Доброе дело'
          : 'Использовано'
  return (
    <li className="transaction-item">
      <span className={`transaction-icon ${item.category}`}>
        <Icon size={21} />
      </span>
      <div className="transaction-copy">
        <strong>{item.note || title}</strong>
        <span>
          {categories[item.category].title}
          {item.destination ? ` → ${categories[item.destination].title}` : ` · ${title}`} ·{' '}
          {dateLabel(item.occurred_on)}
        </span>
      </div>
      <strong className={`transaction-amount ${item.kind === 'deposit' ? 'positive' : ''}`}>
        {item.kind === 'deposit' ? '+' : item.kind === 'withdraw' ? '−' : ''}
        {money(item.amount)}
      </strong>
    </li>
  )
}
export function ActivityCard({
  activity,
  featured = false,
  onOpen,
}: {
  activity: Activity
  featured?: boolean
  onOpen: (activity: Activity) => void
}) {
  return (
    <Card
      className={`activity-card ${activity.category} ${activity.completed_at ? 'is-complete' : ''} ${featured ? 'featured-activity' : ''}`}
    >
      <div className="activity-top">
        <span className={`activity-mark ${activity.category}`}>
          {activity.completed_at ? (
            <Check size={25} />
          ) : (
            <CategoryIcon category={activity.category} size={25} />
          )}
        </span>
        <span className="pill">{activity.completed_at ? 'Выполнено' : activity.tag}</span>
      </div>
      <h2>{activity.title}</h2>
      {featured ? <ActivityInstructions activity={activity} /> : <p>{activity.description}</p>}
      <div className="activity-bottom">
        <span>
          <Clock3 size={16} />
          {activity.duration}
        </span>
        <Button variant={featured ? 'primary' : 'secondary'} onClick={() => onOpen(activity)}>
          {activity.completed_at
            ? 'Вспомнить задание'
            : featured
              ? 'Начать задание'
              : 'Попробовать'}
          <Arrow size={17} />
        </Button>
      </div>
    </Card>
  )
}
function ActivityInstructions({ activity }: { activity: Activity }) {
  return (
    <div className="activity-instructions">
      <h3>Что сделать</h3>
      <ol className="activity-steps">
        {activity.steps.map((step, index) => (
          <li key={step}>
            <span className="activity-step-number" aria-hidden="true">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="activity-outcome">
        <Sprout size={18} aria-hidden="true" />
        <p>
          <strong>Зачем?</strong> {activity.outcome}
        </p>
      </div>
    </div>
  )
}
export function ActivityAction({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const save = useSave(`/activities/${activity.id}/complete`, 'PUT')
  return (
    <div className="activity-detail">
      <div className={`activity-detail-art ${activity.category}`}>
        <Jar category={activity.category} />
      </div>
      <p>{activity.description}</p>
      <ActivityInstructions activity={activity} />
      <div className="small-note">
        <Clock3 size={17} />
        {activity.duration} · Можно делать вместе со взрослым
      </div>
      <p className="small-note">
        Это задание не меняет деньги в копилке. Можно вернуться к нему в любое время.
      </p>
      <FieldError message={save.error?.message} />
      {activity.completed_at ? (
        <div className="success-inline">
          <Check size={20} />
          Выполнено {dateLabel(activity.completed_at)}. Здорово!
        </div>
      ) : (
        <Button
          busy={save.isPending}
          onClick={async () => {
            try {
              await save.mutateAsync({})
              toast.success('Задание выполнено. Ещё одно полезное открытие!')
              onClose()
            } catch {
              /* shown inline */
            }
          }}
        >
          <Check size={19} />Я попробовал!
        </Button>
      )}
    </div>
  )
}
export function BalanceStrip({ state }: { state: AppState }) {
  return (
    <div className="balance-strip">
      {(['save', 'spend', 'help'] as Category[]).map((c) => (
        <div className={c} key={c}>
          <CategoryIcon category={c} />
          <span>{categories[c].title}</span>
          <strong>{money(state.balances[c])}</strong>
        </div>
      ))}
    </div>
  )
}
