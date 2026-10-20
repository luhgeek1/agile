import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Heart,
  History,
  Home as HomeIcon,
  Leaf,
  Plus,
  Settings,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react'
import { api, ApiError, useAppState } from './lib/api'
import type { Activity, AppState } from './lib/types'
import { Button, ErrorState, Loading, Modal, Page } from './components/ui'
import { Jar, Logo } from './components/illustrations'
import { ActivityAction } from './components/product'
import { OperationDialog, type OperationOptions } from './components/operation-dialog'
import { GoalDialog } from './components/goal-dialog'
import {
  HomePage,
  GoalsPage,
  HistoryPage,
  ActivitiesPage,
  ParentPage,
  FeedbackPage,
  SettingsPage,
} from './pages'

export interface ProductContext {
  state: AppState
  add: (options?: OperationOptions) => void
  editGoal: () => void
  openActivity: (activity: Activity) => void
}
export const useProduct = () => useOutletContext<ProductContext>()
const navItems = [
  { to: '/app', icon: HomeIcon, text: 'Моя копилка', short: 'Копилка', end: true },
  { to: '/app/goals', icon: Target, text: 'Моя цель', short: 'Цель' },
  { to: '/app/activities', icon: Sparkles, text: 'Задания', short: 'Задания' },
  { to: '/app/transactions', icon: History, text: 'История', short: 'История' },
]
function Welcome() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const start = useMutation({
    mutationFn: () => api('/demo', { method: 'POST' }),
    onSuccess: () => {
      queryClient.removeQueries()
      navigate('/app')
    },
  })
  return (
    <div className="welcome">
      <header className="welcome-header">
        <Link to="/" aria-label="Главная">
          <Logo />
        </Link>
        <span className="welcome-label">Вместе с настоящей копилкой</span>
      </header>
      <main className="welcome-main">
        <Page>
          <div className="welcome-intro">
            <span className="eyebrow">
              <Leaf size={17} />
              Растём вместе, шаг за шагом
            </span>
            <h1>
              Маленькие привычки.
              <br />
              <span>Большое будущее.</span>
            </h1>
            <p>
              Копить на мечту, выбирать с умом и делать добро.
              <br className="desktop-only" /> Три отсека — целый мир открытий.
            </p>
          </div>
          <div className="welcome-jars">
            {(['save', 'spend', 'help'] as const).map((category, i) => (
              <div className={`welcome-jar ${category}`} key={category}>
                <span className="welcome-number">0{i + 1}</span>
                <Jar category={category} />
                <h2>{['Коплю', 'Трачу', 'Помогаю'][i]}</h2>
                <p>{['Приближаю свою мечту', 'Учусь выбирать', 'Делюсь добром'][i]}</p>
              </div>
            ))}
          </div>
          <div className="welcome-action">
            <Button busy={start.isPending} onClick={() => start.mutate()}>
              Посмотреть демо
              <ArrowRight size={21} />
            </Button>
            <p>Без регистрации. Можно всё попробовать.</p>
            {start.error && (
              <div role="alert" className="field-error">
                {start.error.message}
              </div>
            )}
          </div>
          <div className="welcome-parent">
            <span className="parent-symbol">
              <Users size={25} />
            </span>
            <div>
              <strong>Маленькие открытия лучше делать вместе</strong>
              <p>
                Для детей 6–10 лет и их родителей. Сначала положите деньги в настоящую копилку,
                затем запишите действие здесь.
              </p>
            </div>
            <Heart size={24} className="desktop-only" />
          </div>
        </Page>
      </main>
      <footer className="welcome-footer">
        <p>Образовательный прототип по проекту НЦФГ</p>
        <span>Здесь учатся обращаться с деньгами. Платежей и переводов нет.</span>
      </footer>
    </div>
  )
}
function ProductLayout() {
  const query = useAppState()
  const location = useLocation()
  const [operation, setOperation] = useState<OperationOptions | null>(null)
  const [goalOpen, setGoalOpen] = useState(false)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [demoNoticeHidden, setDemoNoticeHidden] = useState(() => {
    try {
      return localStorage.getItem('kopilka:demo-notice-dismissed') === '1'
    } catch {
      return false
    }
  })
  const dismissDemoNotice = () => {
    setDemoNoticeHidden(true)
    document.getElementById('main')?.focus({ preventScroll: true })
    try {
      localStorage.setItem('kopilka:demo-notice-dismissed', '1')
    } catch {
      // The notice still closes when browser storage is unavailable.
    }
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [location.pathname])
  if (query.isPending) return <Loading />
  if (query.error instanceof ApiError && query.error.status === 401)
    return <Navigate to="/" replace />
  if (query.isError || !query.data)
    return (
      <div className="standalone-error">
        <Logo />
        <ErrorState
          message={query.error?.message ?? 'Попробуйте снова.'}
          retry={() => {
            void query.refetch()
          }}
        />
        <Link to="/">На главную</Link>
      </div>
    )
  const state = query.data
  return (
    <div className="product-layout">
      <a className="skip-link" href="#main">
        К содержимому
      </a>
      <header className="app-header">
        <div className="header-inner">
          <Link to="/app" aria-label="Коплю — Трачу — Помогаю, главная">
            <Logo />
          </Link>
          <nav className="desktop-nav" aria-label="Основная навигация">
            {navItems.map(({ to, text, end }) => (
              <NavLink key={to} to={to} end={end}>
                {text}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <NavLink to="/app/parent" className="parent-link">
              <Users size={20} />
              <span>Родителям</span>
            </NavLink>
            <Link
              className="icon-button settings-link"
              to="/app/settings"
              aria-label="Настройки и справка"
            >
              <Settings size={21} />
            </Link>
            <span className="avatar" aria-label={`Демо-профиль ${state.nickname}`}>
              С
            </span>
          </div>
        </div>
      </header>
      {!demoNoticeHidden && (
        <div className="demo-strip">
          <div>
            <span className="demo-dot" />
            <Link to="/app/settings">Демо-пространство</Link>
            <span className="demo-strip-description">
              Можно пробовать. Все изменения сохраняются.
            </span>
            <span className="demo-mobile-description">Изменения сохраняются</span>
            <button
              type="button"
              className="icon-button demo-strip-close"
              aria-label="Закрыть сообщение о демо-пространстве"
              onClick={dismissDemoNotice}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <main id="main" tabIndex={-1} className="app-main">
        <Outlet
          context={
            {
              state,
              add: (options = {}) => setOperation(options),
              editGoal: () => setGoalOpen(true),
              openActivity: setActivity,
            } satisfies ProductContext
          }
        />
      </main>
      <footer className="app-footer">
        <span>
          <span className="footer-mark">к·т·п</span> Маленькие шаги имеют значение.
        </span>
        <Link to="/app/settings">
          <CircleHelp size={17} />
          Как это работает
        </Link>
        <span>Образовательный прототип · НЦФГ</span>
      </footer>
      <nav className="mobile-nav" aria-label="Навигация на телефоне">
        {navItems.map(({ to, icon: Icon, short, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon size={23} strokeWidth={1.8} />
            <span>{short}</span>
          </NavLink>
        ))}
      </nav>
      <OperationDialog
        open={operation !== null}
        initial={operation ?? {}}
        onClose={() => setOperation(null)}
        state={state}
      />
      <GoalDialog open={goalOpen} onClose={() => setGoalOpen(false)} goal={state.goal} />
      <Modal
        open={!!activity}
        onOpenChange={(v) => {
          if (!v) setActivity(null)
        }}
        title={activity?.title ?? 'Задание'}
        description="Маленькое открытие для тебя и твоей семьи."
      >
        {activity && (
          <ActivityAction
            key={activity.id}
            activity={state.activities.find((a) => a.id === activity.id) ?? activity}
            onClose={() => setActivity(null)}
          />
        )}
      </Modal>
    </div>
  )
}
function NotFound() {
  return (
    <Page className="not-found">
      <span className="eyebrow">Немного заблудились</span>
      <h1>Здесь пока нет странички</h1>
      <p>Зато твоя копилка на месте.</p>
      <Button asChild>
        <Link to="/app">
          К моей копилке
          <ArrowUpRight size={18} />
        </Link>
      </Button>
    </Page>
  )
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}
export function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      <Plus size={21} />
      Добавить действие
    </Button>
  )
}
export const MethodNote = () => (
  <p className="method-note">
    <Check size={16} />
    Задания и подсказки — демонстрационный контент. Требуют методической проверки НЦФГ.
  </p>
)
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/app" element={<ProductLayout />}>
        <Route index element={<HomePage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="transactions" element={<HistoryPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="parent" element={<ParentPage />} />
        <Route path="parent/feedback" element={<FeedbackPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
