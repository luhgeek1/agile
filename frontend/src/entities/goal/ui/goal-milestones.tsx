import { Check, Flag, Sprout } from 'lucide-react'

const milestones = [
  { value: 0, label: 'Начало', Icon: Sprout },
  { value: 50, label: 'Половина пути', Icon: Check },
  { value: 100, label: 'Цель достигнута', Icon: Flag },
]

export function GoalMilestones({ progress }: { progress: number }) {
  const current = progress >= 100 ? 100 : progress >= 50 ? 50 : 0
  return (
    <ol className="goal-milestones" aria-label="Путь к мечте">
      {milestones.map(({ value, label, Icon }) => (
        <li
          key={value}
          data-reached={progress >= value}
          aria-current={current === value ? 'step' : undefined}
        >
          <span className="milestone-mark">
            <Icon size={17} aria-hidden="true" />
          </span>
          <span>{label}</span>
          <small>
            {value}%{progress >= value ? ' · пройдено' : ' · впереди'}
          </small>
        </li>
      ))}
    </ol>
  )
}
