import type { Metadata } from 'next'
import { ActivitiesPage } from '@/views/activities'

export const metadata: Metadata = { title: 'Задания' }

export default function Page() {
  return <ActivitiesPage />
}
