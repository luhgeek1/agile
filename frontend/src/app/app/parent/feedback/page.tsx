import type { Metadata } from 'next'
import { FeedbackPage } from '@/views/feedback'

export const metadata: Metadata = { title: 'Обратная связь' }

export default function Page() {
  return <FeedbackPage />
}
