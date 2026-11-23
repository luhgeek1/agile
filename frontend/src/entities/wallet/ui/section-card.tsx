import { type Category } from '@/shared/api/contracts'
import { money } from '@/shared/lib/money'
import { Card } from '@/shared/ui'
import { ArrowUpRight as Arrow } from 'lucide-react'
import Link from 'next/link'

import { categories } from '../model/categories'
import { Mascot } from './mascot'

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
      <Mascot category={category} />
      <h2>{categories[category].title}</h2>
      <p className="section-description">
        <span className="description-full">{categories[category].description}</span>
        <span className="description-short">{categories[category].short}</span>
      </p>
      <div className="section-bottom">
        <strong data-testid={`balance-${category}`}>
          <span className="pocket-amount" key={amount}>
            {money(amount)}
          </span>
        </strong>
        <button
          className="section-add"
          aria-label={`Добавить деньги в «${categories[category].title}»`}
          onClick={onAdd}
        >
          <span aria-hidden="true">+</span>
          <span className="pocket-add-label">Добавить</span>
        </button>
      </div>
      <Link href={`/app?category=${category}#recent`} className="category-history">
        Записи <Arrow size={15} />
      </Link>
    </Card>
  )
}
