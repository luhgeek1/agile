import { type Goal } from '@/shared/api/contracts'
import { money } from '@/shared/lib/money'
import { Button, Card, Progress } from '@/shared/ui'
import { ArrowUpRight as Arrow, Pencil, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

import { GoalArt } from './goal-art'

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
          Коплю на мечту
        </span>
        <button className="icon-button" aria-label="Редактировать цель" onClick={onEdit}>
          <Pencil size={18} />
        </button>
      </div>
      <div className="goal-art-stage">
        <GoalArt kind={goal.illustration} />
      </div>
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
