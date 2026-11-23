import { ParentGate } from '@/views/parent'
import type { PropsWithChildren } from 'react'

export default function ParentLayout({ children }: PropsWithChildren) {
  return <ParentGate>{children}</ParentGate>
}
