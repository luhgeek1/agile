'use client'

import type { Kind, Transaction } from '@/entities/transaction'
import { TransactionItem } from '@/entities/transaction'
import { categories, categoryKeys, type Category } from '@/entities/wallet'
import { AddButton } from '@/features/record-operation'
import { api } from '@/shared/api'
import { Button, Card, EmptyState, ErrorState, Loading, Page, PageHeading } from '@/shared/ui'
import { useProduct } from '@/widgets/product-shell'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Plus, ShieldCheck } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function HistoryPage() {
  const { add } = useProduct()
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const category = categoryKeys.includes(params.get('category') as Category)
    ? params.get('category')!
    : ''
  const kind = ['deposit', 'withdraw', 'transfer'].includes(params.get('kind') as Kind)
    ? params.get('kind')!
    : ''
  const query = useInfiniteQuery({
    queryKey: ['transactions', category, kind],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      api<{ items: Transaction[]; has_more: boolean }>(
        `/transactions?offset=${pageParam}&limit=30${category ? `&category=${category}` : ''}${kind ? `&kind=${kind}` : ''}`,
      ),
    getNextPageParam: (lastPage, pages) => (lastPage.has_more ? pages.length * 30 : undefined),
  })
  const changeFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const search = next.toString()
    router.push(search ? `${pathname}?${search}` : pathname, { scroll: false })
  }
  const items = query.data?.pages.flatMap((p) => p.items) ?? []
  return (
    <Page>
      <PageHeading
        eyebrow="Мои маленькие шаги"
        title="История копилки"
        description="У каждой монетки своя история. Здесь — твои записи."
        action={<AddButton onClick={() => add()} />}
      />
      <Card className="history-card">
        <div className="history-filters">
          <div className="filter-chips" role="group" aria-label="Отсек">
            <button aria-pressed={!category} onClick={() => changeFilter('category', '')}>
              Все отсеки
            </button>
            {categoryKeys.map((c) => (
              <button
                key={c}
                className={c}
                aria-pressed={category === c}
                onClick={() => changeFilter('category', c)}
              >
                {categories[c].title}
              </button>
            ))}
          </div>
          <label className="type-filter">
            <span>Действие</span>
            <select
              aria-label="Тип операции"
              value={kind}
              onChange={(e) => changeFilter('kind', e.target.value)}
            >
              <option value="">Все действия</option>
              <option value="deposit">Пополнения</option>
              <option value="withdraw">Использование</option>
              <option value="transfer">Переносы</option>
            </select>
          </label>
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.isError ? (
          <ErrorState
            message={query.error.message}
            retry={() => {
              void query.refetch()
            }}
          />
        ) : items.length ? (
          <>
            <ul className="history-list">
              {items.map((t) => (
                <TransactionItem key={t.id} item={t} />
              ))}
            </ul>
            {query.hasNextPage && (
              <div className="load-more">
                <Button
                  variant="secondary"
                  busy={query.isFetchingNextPage}
                  onClick={() => {
                    void query.fetchNextPage()
                  }}
                >
                  Показать ещё
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="Здесь пока тихо"
            description={
              category || kind
                ? 'С такими фильтрами записей нет. Попробуй другие или добавь действие.'
                : 'Положи монетки в настоящую копилку и запиши первый шаг.'
            }
          >
            <Button onClick={() => add(category ? { category: category as Category } : {})}>
              <Plus size={19} />
              Добавить действие
            </Button>
            {(category || kind) && (
              <Button variant="ghost" onClick={() => router.push(pathname, { scroll: false })}>
                Сбросить фильтры
              </Button>
            )}
          </EmptyState>
        )}
      </Card>
      <p className="small-note">
        <ShieldCheck size={16} />
        История сохраняется на сервере и доступна только в этой демо-сессии.
      </p>
    </Page>
  )
}
