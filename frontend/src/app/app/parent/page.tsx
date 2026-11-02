import type { Metadata } from 'next'
import { ParentPage } from '@/views/parent'

export const metadata: Metadata = { title: 'Родителям' }

export default function Page() {
  return <ParentPage />
}
