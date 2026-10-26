import type { Goal } from '@/entities/goal'
import { useSave } from '@/shared/api'
import { moneyInput, parseMoney } from '@/shared/lib/money'
import { Button, FieldError, Modal } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bike, BookOpen, Check, Footprints, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  title: z.string().trim().min(2, 'Напиши хотя бы 2 символа').max(60, 'До 60 символов'),
  amount: z.string().refine((v) => parseMoney(v) !== null, 'Введите сумму от 0,01 до 1 000 000 ₽'),
  illustration: z.enum(['bike', 'book', 'skates', 'star']),
})
export function GoalDialog({
  open,
  onClose,
  goal,
}: {
  open: boolean
  onClose: () => void
  goal: Goal | null
}) {
  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
      title={goal ? 'Настроим твою мечту' : 'О чём ты мечтаешь?'}
      description="Большая мечта начинается с маленького шага."
    >
      <GoalForm key={String(open)} onClose={onClose} goal={goal} />
    </Modal>
  )
}
function GoalForm({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  const save = useSave('/goal', 'PUT')
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: goal?.title ?? '',
      amount: goal ? moneyInput(goal.target) : '',
      illustration: goal?.illustration ?? 'bike',
    },
  })
  return (
    <form
      className="form-stack"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        try {
          await save.mutateAsync({
            title: values.title,
            target: parseMoney(values.amount),
            illustration: values.illustration,
          })
          toast.success('Мечта записана. Идём к ней в своём темпе!')
          onClose()
        } catch {
          /* shown inline */
        }
      })}
    >
      <label>
        Моя мечта
        <input
          {...register('title')}
          placeholder="Например, новый велосипед"
          maxLength={60}
          aria-invalid={!!errors.title}
        />
        <FieldError message={errors.title?.message} />
      </label>
      <label>
        Сколько нужно рублей?
        <div className="amount-input">
          <input
            {...register('amount')}
            inputMode="decimal"
            placeholder="2500"
            aria-invalid={!!errors.amount}
          />
          <span>₽</span>
        </div>
        <FieldError message={errors.amount?.message} />
      </label>
      <fieldset>
        <legend>Выбери картинку</legend>
        <div className="illustration-picker">
          {(
            [
              ['bike', Bike, 'Велосипед'],
              ['book', BookOpen, 'Книга'],
              ['skates', Footprints, 'Ролики'],
              ['star', Sparkles, 'Моя мечта'],
            ] as const
          ).map(([key, Icon, name]) => (
            <button
              type="button"
              key={key}
              aria-label={name}
              aria-pressed={watch('illustration') === key}
              onClick={() => setValue('illustration', key)}
            >
              <Icon size={26} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <p className="small-note">
        Прогресс — это сумма в отсеке «Коплю». Если поменяешь цель, записанные деньги останутся на
        месте.
      </p>
      <FieldError message={save.error?.message} />
      <Button type="submit" busy={save.isPending}>
        <Check size={19} />
        Сохранить цель
      </Button>
    </form>
  )
}
