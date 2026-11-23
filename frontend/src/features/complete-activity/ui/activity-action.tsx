import { useSave } from '@/shared/api'
import { type Activity } from '@/shared/api/contracts'
import { dateLabel } from '@/shared/lib/money'
import { Button, FieldError } from '@/shared/ui'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

import { ActivityInstructions } from '@/entities/activity'

export function ActivityAction({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const save = useSave(`/activities/${activity.id}/complete`, 'PUT')
  return (
    <div className="activity-detail">
      <ActivityInstructions activity={activity} />
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
              toast.success('Задание выполнено!')
              onClose()
            } catch {
              /* shown inline */
            }
          }}
        >
          <Check size={19} />
          Готово!
        </Button>
      )}
    </div>
  )
}
