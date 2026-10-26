import { type Transaction } from '@/shared/api/contracts'
import { dateLabel, money } from '@/shared/lib/money'
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react'

import { categories } from '@/entities/wallet/@x/transaction'

export function TransactionItem({ item }: { item: Transaction }) {
  const Icon =
    item.kind === 'deposit'
      ? ArrowDownLeft
      : item.kind === 'transfer'
        ? ArrowLeftRight
        : ArrowUpRight
  const title =
    item.kind === 'deposit'
      ? 'Пополнение'
      : item.kind === 'transfer'
        ? 'Перенос'
        : item.category === 'help'
          ? 'Доброе дело'
          : 'Использовано'
  return (
    <li className="transaction-item">
      <span className={`transaction-icon ${item.category}`}>
        <Icon size={21} />
      </span>
      <div className="transaction-copy">
        <strong>{item.note || title}</strong>
        <span>
          {categories[item.category].title}
          {item.destination ? ` → ${categories[item.destination].title}` : ` · ${title}`} ·{' '}
          {dateLabel(item.occurred_on)}
        </span>
      </div>
      <strong className={`transaction-amount ${item.kind === 'deposit' ? 'positive' : ''}`}>
        {item.kind === 'deposit' ? '+' : item.kind === 'withdraw' ? '−' : ''}
        {money(item.amount)}
      </strong>
    </li>
  )
}
