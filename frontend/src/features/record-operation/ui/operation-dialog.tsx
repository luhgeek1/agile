import type { AppState } from '@/entities/demo-session'
import type { Kind } from '@/entities/transaction'
import { categories, categoryKeys, type Category } from '@/entities/wallet'
import { useSave } from '@/shared/api'
import { money, parseMoney, today } from '@/shared/lib/money'
import { Button, FieldError, Modal } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Tabs from '@radix-ui/react-tabs'
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Check, Info } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { OperationOptions } from '../model/types'

const schema = z.object({
  amount: z
    .string()
    .refine(
      (v) => parseMoney(v) !== null,
      'Введите от 0,01 до 1 000 000 ₽, не больше двух знаков после запятой',
    ),
  occurred_on: z
    .string()
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= '2000-01-01' && v <= today(),
      'Выберите дату не позднее сегодняшней',
    ),
  note: z.string().trim().max(160, 'До 160 символов'),
})
type Values = z.infer<typeof schema>
export function OperationDialog({
  open,
  onClose,
  state,
  initial = {},
}: {
  open: boolean
  onClose: () => void
  state: AppState
  initial?: OperationOptions
}) {
  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
      title="Добавить действие"
      description="Сначала действие с настоящей копилкой, потом — запись здесь."
    >
      <OperationForm
        key={`${open}-${initial.category}-${initial.kind}`}
        state={state}
        initial={initial}
        onClose={onClose}
      />
    </Modal>
  )
}
function OperationForm({
  state,
  initial,
  onClose,
}: {
  state: AppState
  initial: OperationOptions
  onClose: () => void
}) {
  const [kind, setKind] = useState<Kind>(initial.kind ?? 'deposit')
  const [category, setCategory] = useState<Category>(initial.category ?? 'save')
  const [destination, setDestination] = useState<Category>('spend')
  const [requestId, setRequestId] = useState(crypto.randomUUID())
  const save = useSave('/transactions')
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', occurred_on: today(), note: '' },
  })
  const submit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync({
        ...values,
        amount: parseMoney(values.amount),
        kind,
        category,
        destination: kind === 'transfer' ? destination : null,
        request_id: requestId,
      })
      toast.success(
        kind === 'deposit'
          ? 'Монетки на месте! Запись сохранена.'
          : kind === 'transfer'
            ? 'Перенос записан. Проверь настоящую копилку.'
            : 'Всё записано. Теперь в копилке порядок!',
      )
      onClose()
    } catch {
      /* error rendered below; keep the idempotency key for safe retries */
    }
  })
  // A changed payload is a new intention. Retrying unchanged values reuses its key.
  const changed = () => {
    setRequestId(crypto.randomUUID())
    save.reset()
  }
  return (
    <form onSubmit={submit} onChange={changed} noValidate className="form-stack">
      <Tabs.Root
        className="form-stack"
        value={kind}
        onValueChange={(v) => {
          setKind(v as Kind)
          changed()
        }}
      >
        <Tabs.List className="action-tabs" aria-label="Тип действия">
          <Tabs.Trigger value="deposit">
            <ArrowDownLeft size={18} />
            Добавил
          </Tabs.Trigger>
          <Tabs.Trigger value="withdraw">
            <ArrowUpRight size={18} />
            Использовал
          </Tabs.Trigger>
          <Tabs.Trigger value="transfer">
            <ArrowLeftRight size={18} />
            Перенёс
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value={kind} className="form-stack">
          <fieldset>
            <legend>{kind === 'transfer' ? 'Из какого отсека?' : 'Выбери отсек'}</legend>
            <div className="category-picker">
              {categoryKeys.map((c) => (
                <button
                  type="button"
                  aria-pressed={category === c}
                  className={`category-option ${c}`}
                  key={c}
                  onClick={() => {
                    setCategory(c)
                    if (destination === c) setDestination(categoryKeys.find((k) => k !== c)!)
                    changed()
                  }}
                >
                  <span>
                    {categories[c].title}
                    {category === c && <Check size={15} />}
                  </span>
                  <small>{money(state.balances[c])}</small>
                </button>
              ))}
            </div>
          </fieldset>
          {kind === 'transfer' && (
            <label>
              В какой отсек?
              <select
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value as Category)
                  changed()
                }}
              >
                {categoryKeys
                  .filter((c) => c !== category)
                  .map((c) => (
                    <option key={c} value={c}>
                      {categories[c].title}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <label>
            Сколько рублей?
            <div className="amount-input">
              <input
                {...register('amount')}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                aria-invalid={!!errors.amount}
                aria-describedby="amount-error"
              />
              <span>₽</span>
            </div>
            <span id="amount-error">
              <FieldError message={errors.amount?.message} />
            </span>
          </label>
          <div className="quick-amounts">
            {['50', '100', '150', '500'].map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => {
                  setValue('amount', v, { shouldValidate: true })
                  changed()
                }}
              >
                {v} ₽
              </button>
            ))}
          </div>
          <div className="form-grid">
            <label>
              Когда?
              <input
                type="date"
                {...register('occurred_on')}
                max={today()}
                min="2000-01-01"
                aria-invalid={!!errors.occurred_on}
              />
              <FieldError message={errors.occurred_on?.message} />
            </label>
            <label>
              <span className="field-label">
                Заметка <span className="optional">необязательно</span>
              </span>
              <input {...register('note')} maxLength={160} placeholder="Например, подарок" />
              <FieldError message={errors.note?.message} />
            </label>
          </div>
          <p className="small-note">
            <Info size={16} />
            {kind === 'deposit'
              ? 'Приложение только записывает деньги. Оно не пополняет копилку за тебя.'
              : 'Запиши, что уже произошло с деньгами в настоящей копилке.'}
          </p>
          <FieldError message={save.error?.message} />
          <Button type="submit" busy={save.isPending} className="w-full">
            <Check size={19} />
            Сохранить действие
          </Button>
        </Tabs.Content>
      </Tabs.Root>
    </form>
  )
}
