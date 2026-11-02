'use client'

import type { Activity } from '@/entities/activity'
import type { AppState } from '@/entities/demo-session'
import type { OperationOptions } from '@/features/record-operation'
import { createContext, useContext } from 'react'

export interface ProductContext {
  state: AppState
  add: (options?: OperationOptions) => void
  editGoal: () => void
  openActivity: (activity: Activity) => void
}
export const ProductStateContext = createContext<ProductContext | null>(null)

export function useProduct() {
  const context = useContext(ProductStateContext)
  if (!context) throw new Error('useProduct must be used inside ProductLayout')
  return context
}
