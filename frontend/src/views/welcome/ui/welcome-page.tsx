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
  const start = useMutation({
    mutationFn: () => api('/demo', { method: 'POST' }),
    onSuccess: () => {
      queryClient.removeQueries()
      router.push('/app')
    },
  })

  return (
    <div className="welcome">
      <header className="welcome-header">
        <Link href="/" aria-label="Коплю — Трачу — Помогаю, главная">
          <Logo />
        </Link>
        <a className="welcome-family-link" href="#welcome-family">
          Родителям <ArrowRight size={16} aria-hidden="true" />
        </a>
      </header>
      <main className="welcome-main">
        <Page>
          <section className="welcome-hero">
            <div className="welcome-intro">
              <h1>У мечты есть своя копилка.</h1>
              <p>Копи на мечту, выбирай покупки с умом и помогай другим.</p>
              <div className="welcome-action">
                <Button busy={start.isPending} onClick={() => start.mutate()}>
                  Посмотреть демо <ArrowRight size={20} aria-hidden="true" />
                </Button>
                <p>Без регистрации. Можно всё попробовать.</p>
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
          <section className="welcome-family" id="welcome-family">
            <Users size={26} aria-hidden="true" />
            <div>
              <h2>Для детей 6–10 лет и их родителей</h2>
              <p>Положите деньги в настоящую копилку, затем вместе запишите действие здесь.</p>
            </div>
          </section>
        </Page>
      </main>
      <footer className="welcome-footer">
        <p>Образовательный прототип по проекту НЦФГ</p>
        <p>В демо нет платежей и переводов реальных денег.</p>
      </footer>
    </div>
  )
}
