import { type Activity } from '@/shared/api/contracts'
import { Button, Card } from '@/shared/ui'
import { ArrowUpRight as Arrow, Check, Clock3 } from 'lucide-react'

import { CategoryIcon } from '@/entities/wallet/@x/activity'

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
        {activity.completed_at && <span className="pill">Выполнено</span>}
      </div>
      <h2>{activity.title}</h2>
      <p>{activity.description}</p>
      <div className="activity-bottom">
        <span>
          <Clock3 size={16} />
          {activity.duration}
        </span>
        <Button variant={featured ? 'primary' : 'secondary'} onClick={() => onOpen(activity)}>
          {activity.completed_at ? 'Вспомнить задание' : 'Начать задание'}
          <Arrow size={17} />
        </Button>
      </div>
    </Card>
  )
}
