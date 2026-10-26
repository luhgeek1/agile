import { type AppState, type Category } from '@/shared/api/contracts'
import { money } from '@/shared/lib/money'

import { categories } from '../model/categories'
import { CategoryIcon } from './category-icon'

export function BalanceStrip({ state }: { state: AppState }) {
  return (
    <div className="balance-strip">
      {(['save', 'spend', 'help'] as Category[]).map((c) => (
        <div className={c} key={c}>
          <CategoryIcon category={c} />
          <span>{categories[c].title}</span>
          <strong>{money(state.balances[c])}</strong>
        </div>
      ))}
    </div>
  )
}
