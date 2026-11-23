'use client'

import { useAppState } from '@/entities/demo-session'
import { ActivityAction } from '@/features/complete-activity'
import { GoalDialog } from '@/features/edit-goal'
import { OperationDialog, type OperationOptions } from '@/features/record-operation'
import { ApiError } from '@/shared/api'
import type { Activity } from '@/shared/api/contracts'
import { ErrorState, Loading, Logo, Modal } from '@/shared/ui'
import {
  CircleHelp,
  Gamepad2,
  Home as HomeIcon,
  Settings,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState, type PropsWithChildren } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { ProductStateContext, type ProductContext } from '../model/context'

const navItems = [
  { to: '/app', icon: HomeIcon, text: 'Моя копилка', short: 'Копилка', end: true },
  { to: '/app/goals', icon: Target, text: 'Моя цель', short: 'Цель' },
  { to: '/app/activities', icon: Sparkles, text: 'Задания', short: 'Задания' },
  { to: '/game/index.html', icon: Gamepad2, text: 'Игра', short: 'Игра', external: true },
]
export function ProductLayout({ children }: PropsWithChildren) {
  const query = useAppState()
  const pathname = usePathname()
  const isParent = pathname === '/app/parent' || pathname.startsWith('/app/parent/')
  const router = useRouter()
  const [operation, setOperation] = useState<OperationOptions | null>(null)
  const [goalOpen, setGoalOpen] = useState(false)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [activityFocus, setActivityFocus] = useState<HTMLElement | null>(null)
  const [demoNoticeHidden, setDemoNoticeHidden] = useState(false)
  useEffect(() => {
    try {
      setDemoNoticeHidden(localStorage.getItem('kopilka:demo-notice-dismissed') === '1')
    } catch {
      // Keep the notice visible when browser storage is unavailable.
    }
  }, [])
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
    if (!window.location.hash) window.scrollTo(0, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname, query.isPending])
  const sessionExpired = query.error instanceof ApiError && query.error.status === 401
  useEffect(() => {
    if (sessionExpired) router.replace('/')
  }, [sessionExpired, router])
  if (query.isPending) return <Loading />
  if (sessionExpired) return <Loading />
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
        <Link href="/">На главную</Link>
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
          {isParent ? (
            <Logo />
          ) : (
            <Link href="/app" aria-label="Коплю — Трачу — Помогаю, главная">
              <Logo />
            </Link>
          )}
          {!isParent && (
            <>
              <nav className="desktop-nav" aria-label="Основная навигация">
                {navItems.map(({ to, text, end, external }) => {
                  const NavLink = external ? 'a' : Link
                  return (
                    <NavLink
                      key={to}
                      href={to}
                      className={
                        (end ? pathname === to : pathname.startsWith(to)) ? 'active' : undefined
                      }
                      aria-current={
                        (end ? pathname === to : pathname.startsWith(to)) ? 'page' : undefined
                      }
                    >
                      {text}
                    </NavLink>
                  )
                })}
              </nav>
              <div className="header-actions">
                <Link
                  href="/app/parent"
                  className={`parent-link${pathname.startsWith('/app/parent') ? ' active' : ''}`}
                  aria-current={pathname === '/app/parent' ? 'page' : undefined}
                >
                  <Users size={20} />
                  <span>Родителям</span>
                </Link>
                <Link
                  className="icon-button settings-link"
                  href="/app/settings"
                  aria-label="Настройки и справка"
                >
                  <Settings size={21} />
                </Link>
                <span className="avatar" aria-label={`Демо-профиль ${state.nickname}`}>
                  {state.nickname.slice(0, 1).toLocaleUpperCase('ru-RU')}
                </span>
              </div>
            </>
          )}
        </div>
      </header>
      {!isParent && !demoNoticeHidden && (
        <div className="demo-strip">
          <div>
            <span className="demo-dot" />
            <Link href="/app/settings">Демо</Link>
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
        <ProductStateContext.Provider
          value={
            {
              state,
              add: (options = {}) => setOperation(options),
              editGoal: () => setGoalOpen(true),
              openActivity: (nextActivity, fallbackFocus) => {
                setActivityFocus(fallbackFocus ?? null)
                setActivity(nextActivity)
              },
            } satisfies ProductContext
          }
        >
          {children}
        </ProductStateContext.Provider>
      </main>
      {!isParent && (
        <>
          <footer className="app-footer">
            <Link href="/app/settings">
              <CircleHelp size={17} />
              Как это работает
            </Link>
            <span>Образовательный прототип · НЦФГ</span>
          </footer>
          <nav className="mobile-nav" aria-label="Навигация на телефоне">
            {navItems.map(({ to, icon: Icon, short, end, external }) => {
              const NavLink = external ? 'a' : Link
              return (
                <NavLink
                  key={to}
                  href={to}
                  className={
                    (end ? pathname === to : pathname.startsWith(to)) ? 'active' : undefined
                  }
                  aria-current={
                    (end ? pathname === to : pathname.startsWith(to)) ? 'page' : undefined
                  }
                >
                  <Icon size={23} strokeWidth={1.8} />
                  <span>{short}</span>
                </NavLink>
              )
            })}
          </nav>
        </>
      )}
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
        fallbackFocus={activityFocus}
        description={activity?.description ?? 'Что сделать'}
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
