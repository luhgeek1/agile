'use client'

import { useSave } from '@/shared/api'
import { Button, Card, FieldError, Page, PageHeading } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, ArrowUpRight, Check, Heart, Star } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { z } from 'zod'

const feedbackSchema = z.object({
  usefulness: z.enum(['1', '2', '3', '4', '5'], { error: 'Выберите оценку от 1 до 5' }),
  difficulty: z.enum(['easy', 'okay', 'hard'], { error: 'Выберите, насколько было понятно' }),
  comment: z.string().trim().max(1000, 'Не больше 1000 символов'),
  adult: z.boolean().refine((v) => v, 'Подтвердите, что форму заполняет взрослый'),
})
export function FeedbackPage() {
  const save = useSave('/feedback')
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { comment: '', adult: false },
  })
  return (
    <Page>
      <Link className="back-link" href="/app/parent">
        ← Родительское пространство
      </Link>
      <PageHeading
        eyebrow="Ваш опыт важен"
        title="Пара слов о копилке"
        description="Добровольная обратная связь взрослого для развития проекта НЦФГ."
      />
      <div className="feedback-layout">
        <Card className="feedback-form-card">
          {success ? (
            <div className="feedback-success" role="status">
              <span>
                <Check size={35} />
              </span>
              <h2>Спасибо, что поделились!</h2>
              <p>
                Отзыв сохранён на сервере в вашей демо-сессии. Его можно выгрузить в настройках.
                Автоматической отправки в НЦФГ в этой версии нет.
              </p>
              <Button asChild>
                <Link href="/app/parent">
                  К прогрессу ребёнка
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSuccess(false)
                  reset()
                  save.reset()
                }}
              >
                Оставить ещё один отзыв
              </Button>
            </div>
          ) : (
            <form
              noValidate
              className="form-stack"
              onSubmit={handleSubmit(async (v) => {
                try {
                  await save.mutateAsync({
                    usefulness: Number(v.usefulness),
                    difficulty: v.difficulty,
                    comment: v.comment,
                    adult_confirmed: v.adult,
                  })
                  setSuccess(true)
                } catch {
                  /* shown inline */
                }
              })}
            >
              <fieldset>
                <legend>Насколько полезна цифровая копилка?</legend>
                <p className="field-hint">1 — пока не помогает, 5 — очень помогает</p>
                <div className="rating-options">
                  {['1', '2', '3', '4', '5'].map((value) => (
                    <label key={value}>
                      <input type="radio" value={value} {...register('usefulness')} />
                      <span>
                        <Star size={22} />
                        {value}
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError message={errors.usefulness?.message} />
              </fieldset>
              <fieldset>
                <legend>Удалось разобраться?</legend>
                <div className="difficulty-options">
                  {[
                    ['easy', 'Всё понятно'],
                    ['okay', 'С небольшой помощью'],
                    ['hard', 'Было сложно'],
                  ].map(([v, label]) => (
                    <label key={v}>
                      <input type="radio" value={v} {...register('difficulty')} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <FieldError message={errors.difficulty?.message} />
              </fieldset>
              <label>
                Что помогло или чего не хватило? <span className="optional">необязательно</span>
                <textarea
                  {...register('comment')}
                  rows={4}
                  maxLength={1000}
                  placeholder="Расскажите о своём опыте без личных данных ребёнка"
                />
                <FieldError message={errors.comment?.message} />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" {...register('adult')} />
                <span>Я взрослый и понимаю, что отзыв сохраняется в демонстрационной версии.</span>
              </label>
              <FieldError message={errors.adult?.message} />
              <FieldError message={save.error?.message} />
              <Button type="submit" busy={save.isPending}>
                Сохранить отзыв
                <ArrowUpRight size={18} />
              </Button>
            </form>
          )}
        </Card>
        <aside className="feedback-aside">
          <span className="tip-icon help">
            <Heart size={28} />
          </span>
          <h2>Только то, чем хочется поделиться</h2>
          <p>Не указывайте имя, возраст, школу, контакты и другие личные данные ребёнка.</p>
          <p>
            В демо отзыв доступен только в этой сессии. НЦФГ не получает доступ к профилю ребёнка.
          </p>
          <Link href="/app/settings" className="text-link">
            О демо и данных
            <ArrowUpRight size={17} />
          </Link>
        </aside>
      </div>
    </Page>
  )
}
