import type { Activity } from '@/entities/activity'
import type { AppState } from '@/entities/demo-session'
import type { OperationOptions } from '@/features/record-operation'
import { useOutletContext } from 'react-router-dom'

export interface ProductContext {
  state: AppState
  add: (options?: OperationOptions) => void
  editGoal: () => void
  openActivity: (activity: Activity) => void
}
export const useProduct = () => useOutletContext<ProductContext>()
