import { type Category } from '@/shared/api/contracts'
import { Heart, PiggyBank, ShoppingBag } from 'lucide-react'

export const CategoryIcon = ({ category, size = 22 }: { category: Category; size?: number }) => {
  const Icon = { save: PiggyBank, spend: ShoppingBag, help: Heart }[category]
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}
