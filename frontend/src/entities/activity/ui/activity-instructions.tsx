import { type Activity } from '@/shared/api/contracts'
import { Sprout } from 'lucide-react'

export function ActivityInstructions({ activity }: { activity: Activity }) {
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
