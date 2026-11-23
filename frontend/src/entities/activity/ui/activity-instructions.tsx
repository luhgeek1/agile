import { type Activity } from '@/shared/api/contracts'

export function ActivityInstructions({ activity }: { activity: Activity }) {
  return (
    <div className="activity-instructions">
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
    </div>
  )
}
