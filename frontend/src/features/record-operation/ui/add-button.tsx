import { Button } from '@/shared/ui'
import { Plus } from 'lucide-react'

export function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      <Plus size={21} />
      Добавить действие
    </Button>
  )
}
