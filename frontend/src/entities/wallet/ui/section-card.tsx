import { type Category } from '@/shared/api/contracts'
import { money } from '@/shared/lib/money'
import { Card } from '@/shared/ui'
import { ArrowUpRight as Arrow } from 'lucide-react'
import Link from 'next/link'

import { categories } from '../model/categories'
import { Jar } from './jar'

export function SectionCard({
  category,
  amount,
  onAdd,
}: {
  category: Category
  amount: number
  onAdd: () => void
}) {
  return (
    <Card className={`section-card pocket-card ${category}`}>
      <Jar category={category} />
      <h2>{categories[category].title}</h2>
      <p className="section-description">
        <span className="description-full">{categories[category].description}</span>
        <span className="description-short">{categories[category].short}</span>
      </p>
      <div className="section-bottom">
        <strong data-testid={`balance-${category}`}>{money(amount)}</strong>
        <button
          className="section-add"
          aria-label={`Добавить деньги в «${categories[category].title}»`}
          onClick={onAdd}
        >
          <span aria-hidden="true">+</span>
          <span className="pocket-add-label">Добавить</span>
        </button>
      </div>
      <Link href={`/app/transactions?category=${category}`} className="category-history">
        История отсека <Arrow size={15} />
      </Link>
    </Card>
  )
}
