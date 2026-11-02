import type { Metadata } from 'next'
import { HistoryPage } from '@/views/history'
import { Suspense } from 'react'
import { Loading } from '@/shared/ui'

export const metadata: Metadata = { title: 'История' }

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <HistoryPage />
    </Suspense>
  )
}
