import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  Heart,
  History,
  Info,
  Leaf,
  MessageCircle,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { AddButton, MethodNote, PageHeading, useProduct } from './app'
import { api, useSave } from './lib/api'
import { categories, categoryKeys, type Category, type Kind, type Transaction } from './lib/types'
import { dateLabel, money } from './lib/money'
import { ActivityCarousel } from './components/activity-carousel'
import {
  ActivityCard,
  BalanceStrip,
  GoalCard,
  SectionCard,
  TransactionItem,
} from './components/product'
import {
  Button,
  Card,
  Confirm,
  EmptyState,
  ErrorState,
  FieldError,
  Loading,
  Page,
  Progress,
} from './components/ui'

export function HomePage() {
  const { state, add, editGoal, openActivity } = useProduct()
  const total = Object.values(state.balances).reduce((a, b) => a + b, 0)
  return (
    <Page>
      <div className="home-hero">
        <div>
          <div className="greeting">
            <span className="greeting-sun" aria-hidden="true">
              ✳
            </span>
            Привет, {state.nickname}!
          </div>
          <h1>
            У каждой мечты
            <br />
            есть <span>своя копилка.</span>
          </h1>
          <p>Копи, выбирай, помогай. Что сделаем сегодня?</p>
        </div>
        <div className="home-hero-side">
          <span className="handwritten">
            Большое начинается
            <br />с маленького!
          </span>
          <svg viewBox="0 0 110 52" aria-hidden="true">
            <path
              d="M8 4q-4 28 77 25m-15-11 16 11-14 12"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <AddButton onClick={() => add()} />
        </div>
      </div>
      <div className="home-columns">
        <div className="home-piggy-area">
          <div className="section-heading">
            <h2>Мои три отсека</h2>
            <span className="total-balance">
              Всего <strong>{money(total)}</strong>
            </span>
          </div>
          <div className="sections-grid">
            {categoryKeys.map((c) => (
              <SectionCard
                key={c}
                category={c}
                amount={state.balances[c]}
                onAdd={() => add({ category: c })}
              />
            ))}
          </div>
          <p className="physical-note">
            <Info size={15} />
            Это твои записи. Настоящие монетки живут в настоящей копилке.
          </p>
        </div>
        <div className="home-goal">
          <GoalCard goal={state.goal} onEdit={editGoal} />
        </div>
      </div>
      <div className="home-bottom">
        <section className="home-task">
          <div className="section-heading">
            <h2>
              <Sparkles size={21} />
              Выбери задание
            </h2>
            <Link className="text-link" to="/app/activities">
              Все задания
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <ActivityCarousel activities={state.activities} onOpen={openActivity} />
        </section>
        <section className="home-recent">
          <div className="section-heading">
            <h2>
              <History size={21} />
              Последние шаги
            </h2>
          </div>
          <Card className="recent-card">
            {state.recent_transactions.length ? (
              <ul>
                {state.recent_transactions.map((t) => (
                  <TransactionItem key={t.id} item={t} />
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Твоя история начинается"
                description="Запиши первое действие с копилкой."
              >
                <Button onClick={() => add()}>Добавить действие</Button>
              </EmptyState>
            )}
          </Card>
          <Link className="text-link recent-history-link" to="/app/transactions">
            Посмотреть всю историю
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
      <div className="together-note">
        <Heart size={20} />
        <p>Мечтать интереснее вместе. Позови взрослого — у него тоже есть своя страничка.</p>
        <Link to="/app/parent">
          Родителям
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </Page>
  )
}
export function GoalsPage() {
  const { state, add, editGoal } = useProduct()
  return (
    <Page>
      <PageHeading
        eyebrow="Шаг за шагом"
        title="У меня есть мечта"
        description="Большая или маленькая — главное, что она твоя."
      />
      <div className="goals-layout">
        <GoalCard
          goal={state.goal}
          onEdit={editGoal}
          large
          onAdd={() => add({ category: 'save' })}
        />
        <div className="goal-aside">
          <Card>
            <span className="tip-icon save">
              <Sprout size={25} />
            </span>
            <h2>Как растёт мечта?</h2>
            <ol className="steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Выбери то, что важно тебе</strong>
                  <p>Узнай стоимость вместе со взрослым.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Добавляй в «Коплю»</strong>
                  <p>Любая сумма — уже маленький шаг.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Замечай свой прогресс</strong>
                  <p>Здесь видны деньги, которые ты записал.</p>
                </div>
              </li>
            </ol>
          </Card>
          <div className="soft-note">
            <Heart size={21} />
            <p>Можно передумать и выбрать новую цель. Мечты меняются — и это нормально.</p>
          </div>
        </div>
      </div>
    </Page>
  )
}
export function HistoryPage() {
  const { add } = useProduct()
  const [params, setParams] = useSearchParams()
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
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
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
              <Button variant="ghost" onClick={() => setParams({})}>
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
export function ActivitiesPage() {
  const { state, openActivity } = useProduct()
  const [filter, setFilter] = useState('all')
  const completed = state.activities.filter((a) => a.completed_at).length
  return (
    <Page>
      <PageHeading
        eyebrow="Делаем открытия"
        title="Полезные привычки — играючи"
        description="Немного любопытства, несколько минут и кто-то рядом."
      />
      <Card className="discovery-banner">
        <span className="discovery-icon">
          <Sparkles size={35} />
        </span>
        <div>
          <h2>Твоя коллекция открытий</h2>
          <p>Здесь нет гонки. Выбирай задание по настроению.</p>
          <Progress
            value={(completed / state.activities.length) * 100}
            label="Выполненные задания"
          />
        </div>
        <strong>
          {completed}
          <span>из {state.activities.length}</span>
        </strong>
      </Card>
      <div className="filter-chips activity-filters" role="group" aria-label="Фильтр заданий">
        {[
          ['all', 'Все открытия'],
          ['new', 'Можно попробовать'],
          ['done', 'Выполнено'],
        ].map(([key, label]) => (
          <button aria-pressed={filter === key} key={key} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="activities-grid">
        {state.activities
          .filter(
            (a) => filter === 'all' || (filter === 'done' ? !!a.completed_at : !a.completed_at),
          )
          .map((a) => (
            <ActivityCard key={a.id} activity={a} onOpen={openActivity} />
          ))}
      </div>
      {filter === 'done' && completed === 0 && (
        <EmptyState
          title="Первое открытие впереди"
          description="Выбери любое задание. Можно делать его вместе со взрослым."
        >
          <Button onClick={() => setFilter('new')}>Выбрать задание</Button>
        </EmptyState>
      )}
      {filter === 'new' && completed === state.activities.length && (
        <EmptyState
          title="Все открытия с тобой!"
          description="Ты можешь повторить любое задание или придумать своё вместе со взрослым."
        >
          <Button onClick={() => setFilter('all')}>Все задания</Button>
        </EmptyState>
      )}
      <MethodNote />
    </Page>
  )
}
export function ParentPage() {
  const { state, editGoal, openActivity } = useProduct()
  const completed = state.activities.filter((a) => a.completed_at)
  return (
    <Page className="parent-page">
      <PageHeading
        eyebrow="Родительское пространство"
        title="Рядом с каждым открытием"
        description="Помогайте замечать маленькие шаги. Большие разговоры начинаются с них."
        action={
          <span className="parent-mode">
            <Users size={18} />
            Режим родителя · демо
          </span>
        }
      />
      <div className="parent-intro">
        <ShieldCheck size={22} />
        <p>
          Вы смотрите данные демо-профиля «{state.nickname}». Это отдельная зона интерфейса, без
          защиты PIN-кодом. Ввод реальных данных детей здесь не предусмотрен.
        </p>
      </div>
      <BalanceStrip state={state} />
      <div className="parent-stats">
        <Card>
          <History size={23} />
          <strong>{state.transaction_count}</strong>
          <span>записей о деньгах</span>
        </Card>
        <Card>
          <CheckCircle2 size={23} />
          <strong>
            {completed.length} из {state.activities.length}
          </strong>
          <span>выполненных заданий</span>
        </Card>
        <Card>
          <Target size={23} />
          <strong>{state.goal?.progress ?? 0}%</strong>
          <span>пути к текущей цели</span>
        </Card>
      </div>
      <p className="small-note">
        По записям вашей демо-семьи. Это не оценка финансового поведения ребёнка.
      </p>
      <div className="parent-columns">
        <Card>
          <div className="section-heading">
            <h2>Последние действия</h2>
            <Link className="text-link" to="/app/transactions">
              История
              <ArrowUpRight size={17} />
            </Link>
          </div>
          {state.recent_transactions.length ? (
            <ul>
              {state.recent_transactions.map((t) => (
                <TransactionItem key={t.id} item={t} />
              ))}
            </ul>
          ) : (
            <p className="muted">Пока нет записей. Первое действие можно добавить в копилке.</p>
          )}
        </Card>
        <div className="parent-summary">
          <Card>
            <span className="eyebrow">
              <Target size={16} />
              Текущая цель
            </span>
            <h2>{state.goal?.title ?? 'Мечта ещё не выбрана'}</h2>
            <p>
              {state.goal
                ? `${money(state.goal.saved)} из ${money(state.goal.target)}`
                : 'Помогите ребёнку выбрать то, что ему интересно.'}
            </p>
            <Progress value={state.goal?.progress ?? 0} label="Прогресс цели ребёнка" />
            <Button variant="secondary" onClick={editGoal}>
              Настроить цель вместе
            </Button>
          </Card>
          <Card>
            <h2>Уже попробовали</h2>
            {completed.length ? (
              <ul className="completed-list">
                {completed.map((a) => (
                  <li key={a.id}>
                    <CheckCircle2 size={19} />
                    <button onClick={() => openActivity(a)}>
                      {a.title}
                      <small>{dateLabel(a.completed_at!)}</small>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Открытия впереди. Начните с любого задания.</p>
            )}
            <Link className="text-link" to="/app/activities">
              Все задания
              <ArrowUpRight size={17} />
            </Link>
          </Card>
        </div>
      </div>
      <div className="section-heading material-heading">
        <h2>
          <BookOpen size={23} />О чём поговорить сегодня
        </h2>
        <span className="pill">Для взрослого и ребёнка</span>
      </div>
      <div className="materials-grid">
        {state.materials.map((m, i) => (
          <Card key={m.title}>
            <span className="material-number">0{i + 1}</span>
            <h3>{m.title}</h3>
            <p>{m.body}</p>
          </Card>
        ))}
      </div>
      <MethodNote />
      <div className="feedback-banner">
        <span className="tip-icon spend">
          <MessageCircle size={26} />
        </span>
        <div>
          <h2>Как вашей семье с копилкой?</h2>
          <p>Поделитесь впечатлением: что помогает, а что можно улучшить.</p>
        </div>
        <Button asChild>
          <Link to="/app/parent/feedback">
            Оставить отзыв
            <ArrowUpRight size={18} />
          </Link>
        </Button>
      </div>
    </Page>
  )
}
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
      <Link className="back-link" to="/app/parent">
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
                <Link to="/app/parent">
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
          <Link to="/app/settings" className="text-link">
            О демо и данных
            <ArrowUpRight size={17} />
          </Link>
        </aside>
      </div>
    </Page>
  )
}
export function SettingsPage() {
  const { state } = useProduct()
  const reset = useSave<{ seeded: boolean }>('/demo/reset')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const exportFeedback = async () => {
    setExporting(true)
    setExportError('')
    try {
      const data = await api('/feedback/export')
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      )
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'kopilka-demo-feedback.json'
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Отзывы из этой сессии выгружены')
    } catch (e) {
      setExportError((e as Error).message)
    } finally {
      setExporting(false)
    }
  }
  const resetDemo = async (seeded: boolean) => {
    try {
      await reset.mutateAsync({ seeded })
      toast.success(
        seeded ? 'Демо снова как в первый день' : 'Чистая копилка готова к первым шагам',
      )
    } catch {
      /* shown inline */
    }
  }
  return (
    <Page>
      <PageHeading
        eyebrow="Всё под рукой"
        title="Справка и настройки"
        description="Как устроена копилка и где хранятся твои открытия."
      />
      <div className="settings-layout">
        <div>
          <Card>
            <h2>
              <Info size={23} />
              Как это работает
            </h2>
            <div className="faq">
              <details open>
                <summary>Настоящие деньги или игра?</summary>
                <p>
                  Приложение помогает вести записи о настоящей копилке. Оно не хранит деньги, не
                  принимает платежи и не переводит их. В демо используются учебные суммы.
                </p>
              </details>
              <details>
                <summary>Как меняется прогресс цели?</summary>
                <p>
                  Прогресс равен балансу отсека «Коплю», делённому на стоимость цели. Пополнение
                  увеличивает прогресс, расход или перенос из «Коплю» уменьшает его. Задания не
                  добавляют денег.
                </p>
              </details>
              <details>
                <summary>Сохранятся ли мои действия?</summary>
                <p>
                  Да, на сервере. Этот браузер хранит только cookie демо-сессии на 30 дней. Если
                  удалить cookie или открыть другой браузер, создастся отдельная демо-копилка.
                </p>
              </details>
              <details>
                <summary>Кто видит данные?</summary>
                <p>
                  Только обладатель этой демо-сессии. Не вводите настоящие данные ребёнка. Для
                  работы с реальными семьями потребуются серверная авторизация и отдельная правовая
                  проверка.
                </p>
              </details>
              <details>
                <summary>Что делать, если запись не сохранилась?</summary>
                <p>
                  Проверьте подключение и повторите действие. При повторной отправке неизменённой
                  операции сервер не начислит деньги дважды.
                </p>
              </details>
            </div>
          </Card>
          <Card className="about-card">
            <Leaf size={25} />
            <div>
              <h2>Коплю — Трачу — Помогаю</h2>
              <p>
                Образовательный прототип цифрового продолжения физической «Умной копилки» НЦФГ.
                Дизайн, тексты и механики предложены командой; окончательное согласование с НЦФГ ещё
                впереди.
              </p>
              <span className="pill">Версия 1.0 · Изолированное демо</span>
            </div>
          </Card>
        </div>
        <div>
          <Card className="demo-settings">
            <span className="tip-icon save">
              <ShieldCheck size={25} />
            </span>
            <h2>Твоё демо-пространство</h2>
            <p>
              Профиль «{state.nickname}» · {state.transaction_count} записей. Здесь можно пройти все
              сценарии и начать заново.
            </p>
            <div className="settings-action">
              <h3>Вернуть пример</h3>
              <p>Снова появятся начальные суммы, цель и первое выполненное задание.</p>
              <Confirm
                trigger={
                  <Button variant="secondary" busy={reset.isPending}>
                    <RotateCcw size={18} />
                    Сбросить демо
                  </Button>
                }
                title="Вернуть начальный пример?"
                description="Записи, цель, выполненные задания и отзывы только этой демо-сессии будут заменены начальными. Это нельзя отменить."
                onConfirm={() => {
                  void resetDemo(true)
                }}
                busy={reset.isPending}
              />
            </div>
            <div className="settings-action">
              <h3>Попробовать с нуля</h3>
              <p>Пустые отсеки, чистая история и новая мечта.</p>
              <Confirm
                trigger={
                  <Button variant="ghost" busy={reset.isPending}>
                    Начать с пустой копилкой
                  </Button>
                }
                title="Начать с чистой копилки?"
                description="Все записи, цель, отметки заданий и отзывы только этой демо-сессии будут удалены. Отменить это действие нельзя."
                onConfirm={() => {
                  void resetDemo(false)
                }}
                busy={reset.isPending}
              />
            </div>
            <FieldError message={reset.error?.message} />
          </Card>
          <Card className="export-card">
            <h2>Отзывы для проверки</h2>
            <p>
              JSON-файл с отзывами только этой демо-сессии, без идентификаторов семьи. Не публикуйте
              файл, если сами добавили в текст личные данные.
            </p>
            <Button
              variant="secondary"
              busy={exporting}
              onClick={() => {
                void exportFeedback()
              }}
            >
              <Download size={18} />
              Выгрузить отзывы
            </Button>
            <FieldError message={exportError} />
          </Card>
        </div>
      </div>
    </Page>
  )
}
