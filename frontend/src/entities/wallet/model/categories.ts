import type { Category } from '@/shared/api/contracts'

export const categories: Record<Category, { title: string; description: string; short: string }> = {
  save: { title: 'Коплю', description: 'На маленькие и большие мечты', short: 'На мечту' },
  spend: { title: 'Трачу', description: 'На то, что радует каждый день', short: 'На каждый день' },
  help: { title: 'Помогаю', description: 'На добрые и важные дела', short: 'На добрые дела' },
}
export const categoryKeys: Category[] = ['save', 'spend', 'help']
