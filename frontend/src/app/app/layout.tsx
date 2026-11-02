import { ProductLayout } from '@/widgets/product-shell'
import type { PropsWithChildren } from 'react'

export default function AppLayout({ children }: PropsWithChildren) {
  return <ProductLayout>{children}</ProductLayout>
}
