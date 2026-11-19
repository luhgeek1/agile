import type { Category } from '@/shared/api/contracts'
import Image from 'next/image'

const heights = { save: 488, spend: 481, help: 486 }

export function Mascot({ category, className = '' }: { category: Category; className?: string }) {
  return (
    <Image
      src={`/brand/${category}.webp`}
      width={560}
      height={heights[category]}
      className={`jar ${className}`}
      alt=""
      unoptimized
    />
  )
}
