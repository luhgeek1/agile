'use client'

import { categories, categoryKeys, Mascot } from '@/entities/wallet'
import { api } from '@/shared/api'
import { Button, Logo, Page } from '@/shared/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function WelcomePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const start = useMutation<unknown, Error, 'child' | 'parent'>({
    mutationFn: () => api('/demo', { method: 'POST' }),
    onSuccess: (_, role) => {
      queryClient.removeQueries()
      router.push(role === 'parent' ? '/app/parent' : '/app')
    },
  })

  return (
    <div className="welcome">
      <header className="welcome-header">
        <Link href="/" aria-label="Коплю — Трачу — Помогаю, главная">
          <Logo />
        </Link>
      </header>
      <main className="welcome-main">
        <Page>
          <section className="welcome-hero">
            <div className="welcome-intro">
              <h1>Коплю, трачу, помогаю</h1>
              <p>Твоя копилка, задания и игра.</p>
              <div className="welcome-action">
                <div className="welcome-role-actions">
                  <Button
                    busy={start.isPending && start.variables === 'child'}
                    disabled={start.isPending}
                    onClick={() => start.mutate('child')}
                  >
                    Я ребёнок <ArrowRight size={20} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="secondary"
                    busy={start.isPending && start.variables === 'parent'}
                    disabled={start.isPending}
                    onClick={() => start.mutate('parent')}
                  >
                    Я родитель <Users size={20} aria-hidden="true" />
                  </Button>
                </div>
                {start.error && (
                  <p role="alert" className="field-error">
                    {start.error.message}
                  </p>
                )}
              </div>
            </div>
            <div className="welcome-art" aria-hidden="true">
              {categoryKeys.map((category) => (
                <Mascot
                  category={category}
                  className={`welcome-mascot-${category}`}
                  key={category}
                />
              ))}
            </div>
          </section>
          <section className="welcome-habits" aria-labelledby="welcome-habits-title">
            <h2 id="welcome-habits-title">Три отсека, три привычки</h2>
            <ul>
              {categoryKeys.map((category) => (
                <li className={category} key={category}>
                  <strong>{categories[category].title}</strong>
                  <p>{categories[category].short}</p>
                </li>
              ))}
            </ul>
          </section>
        </Page>
      </main>
      <footer className="welcome-footer">
        <p>Демо-копилка для детей 6–10 лет и родителей.</p>
      </footer>
    </div>
  )
}
