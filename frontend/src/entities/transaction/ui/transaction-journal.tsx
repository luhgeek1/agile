import type { Transaction } from '@/shared/api/contracts'
import { TransactionItem } from './transaction-item'

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Moscow',
})

export function TransactionJournal({ items }: { items: Transaction[] }) {
  const days = new Map<string, Transaction[]>()
  for (const item of items) {
    const records = days.get(item.occurred_on) ?? []
    records.push(item)
    days.set(item.occurred_on, records)
  }
  return (
    <div className="transaction-journal">
      {Array.from(days, ([date, records]) => (
        <section className="history-day" key={date}>
          <h3>
            <time dateTime={date}>{dateFormat.format(new Date(`${date}T12:00:00+03:00`))}</time>
          </h3>
          <ul className="history-list">
            {records.map((item) => (
              <TransactionItem key={item.id} item={item} showDate={false} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
