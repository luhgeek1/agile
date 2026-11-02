'use client'

import { Button, Page } from '@/shared/ui'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export function NotFoundPage() {
  return (
    <Page className="not-found">
      <span className="eyebrow">Немного заблудились</span>
      <h1>Здесь пока нет странички</h1>
      <p>Зато твоя копилка на месте.</p>
      <Button asChild>
        <Link href="/app">
          К моей копилке
          <ArrowUpRight size={18} />
        </Link>
      </Button>
    </Page>
  )
}
