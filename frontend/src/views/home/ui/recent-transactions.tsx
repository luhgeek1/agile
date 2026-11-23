'use client'

import type { Kind, Transaction } from '@/entities/transaction'
import { TransactionJournal } from '@/entities/transaction'
import { categories, categoryKeys, type Category } from '@/entities/wallet'
import { api } from '@/shared/api'
import { Button, Card, EmptyState, ErrorState, Loading, SegmentedControl } from '@/shared/ui'
import { useProduct } from '@/widgets/product-shell'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { History, Plus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function RecentTransactions() {
  const { add } = useProduct()
  const params = useSearchParams()
  const router = useRouter()
  const section = useRef<HTMLElement>(null)
  useEffect(() => {
    if (window.location.hash === '#recent') {
      section.current?.scrollIntoView()
    }
  }, [])
  const category = categoryKeys.includes(params.get('category') as Category)
    ? params.get('category')!
    : ''
  const kind = ['deposit', 'withdraw', 'transfer'].includes(params.get('kind') as Kind)
    ? params.get('kind')!
    : ''
  const pageSize = 5
  const query = useInfiniteQuery({
    queryKey: ['transactions', category, kind],
    initialPageParam: 0,
    placeholderData: keepPreviousData,
    queryFn: ({ pageParam, signal }) =>
      api<{ items: Transaction[]; has_more: boolean }>(
        `/transactions?offset=${pageParam}&limit=${pageSize}${category ? `&category=${category}` : ''}${kind ? `&kind=${kind}` : ''}`,
        { signal },
      ),
    getNextPageParam: (lastPage, pages) =>
      lastPage.has_more ? pages.length * pageSize : undefined,
  })
  const changeFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const search = next.toString()
    router.push(`/app${search ? `?${search}` : ''}#recent`, { scroll: false })
  }
  const items = query.data?.pages.flatMap((p) => p.items) ?? []
  return (
    <section id="recent" className="home-recent" aria-labelledby="recent-title" ref={section}>
      <div className="section-heading">
        <h2 id="recent-title">
          <History size={21} aria-hidden="true" />
          Последние шаги
        </h2>
      </div>
      <Card className="history-card">
        <div className="history-filters">
          <SegmentedControl
            label="Отсек"
            value={category}
            onChange={(value) => changeFilter('category', value)}
            options={[
              { value: '', label: 'Все отсеки' },
              ...categoryKeys.map((value) => ({ value, label: categories[value].title })),
            ]}
          />
          <label className="type-filter">
            <span>Действие</span>
            <select
              aria-label="Тип операции"
              value={kind}
              onChange={(e) => changeFilter('kind', e.target.value)}
            >
              <option value="">Все действия</option>
              <option value="deposit">Пополнения</option>
              <option value="withdraw">Траты и помощь</option>
              <option value="transfer">Переносы</option>
            </select>
          </label>
        </div>
        <p className="sr-only" role="status">
          {query.isPending
            ? 'Загружаем записи…'
            : query.isError
              ? 'Записи пока недоступны'
              : query.isPlaceholderData
                ? 'Обновляем записи…'
                : `Показано записей: ${items.length}`}
        </p>
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
            <div className="history-results" aria-busy={query.isPlaceholderData}>
              <TransactionJournal items={items} />
            </div>
            {query.hasNextPage && (
              <div className="load-more">
                <Button
                  variant="secondary"
                  busy={query.isFetchingNextPage}
                  disabled={query.isPlaceholderData}
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
            title={category || kind ? 'Таких записей пока нет' : 'Записей пока нет'}
            description={
              category || kind
                ? 'Попробуй другие фильтры.'
                : 'Добавь первую запись о деньгах в копилке.'
            }
          >
            <Button onClick={() => add(category ? { category: category as Category } : {})}>
              <Plus size={19} />
              Добавить действие
            </Button>
            {(category || kind) && (
              <Button variant="ghost" onClick={() => router.push('/app#recent', { scroll: false })}>
                Сбросить фильтры
              </Button>
            )}
          </EmptyState>
        )}
      </Card>
    </section>
  )
}
