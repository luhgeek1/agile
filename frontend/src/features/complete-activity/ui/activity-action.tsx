import { useSave } from '@/shared/api'
import { type Activity } from '@/shared/api/contracts'
import { dateLabel } from '@/shared/lib/money'
import { Button, FieldError } from '@/shared/ui'
import { Check, Clock3 } from 'lucide-react'
import { toast } from 'sonner'

import { ActivityInstructions } from '@/entities/activity'
import { Jar } from '@/entities/wallet'

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
