export type Category = 'save' | 'spend' | 'help'
export type Kind = 'deposit' | 'withdraw' | 'transfer'
export type Illustration = 'bike' | 'book' | 'skates' | 'star'
export interface Transaction {
  id: string
  kind: Kind
  category: Category
  destination: Category | null
  amount: number
  occurred_on: string
  note: string
  created_at: string
}
export interface Goal {
  title: string
  target: number
  saved: number
  remaining: number
  progress: number
  achieved: boolean
  illustration: Illustration
}
export interface Activity {
  id: string
  category: Category
  title: string
  description: string
  steps: string[]
  outcome: string
  duration: string
  tag: string
  completed_at: string | null
}
export interface AppState {
  mode: 'demo'
  nickname: string
  balances: Record<Category, number>
  goal: Goal | null
  activities: Activity[]
  recent_transactions: Transaction[]
  materials: { title: string; body: string }[]
  transaction_count: number
}
export const categories: Record<Category, { title: string; description: string; short: string }> = {
  save: { title: 'Коплю', description: 'На маленькие и большие мечты', short: 'На мечту' },
  spend: { title: 'Трачу', description: 'На то, что радует каждый день', short: 'На каждый день' },
  help: { title: 'Помогаю', description: 'На добрые и важные дела', short: 'На добрые дела' },
}
export const categoryKeys: Category[] = ['save', 'spend', 'help']
