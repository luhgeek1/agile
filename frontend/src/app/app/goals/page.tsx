import type { Metadata } from 'next'
import { GoalsPage } from '@/views/goals'

export const metadata: Metadata = { title: 'Моя цель' }

export default function Page() {
  return <GoalsPage />
}
