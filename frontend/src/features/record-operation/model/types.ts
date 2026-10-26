import type { Kind } from '@/entities/transaction'
import type { Category } from '@/entities/wallet'

export type OperationOptions = { category?: Category; kind?: Kind }
