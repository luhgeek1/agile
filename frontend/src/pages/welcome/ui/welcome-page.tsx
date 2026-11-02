import { Jar } from '@/entities/wallet'
import { api } from '@/shared/api'
import { Button, Logo, Page } from '@/shared/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Heart, Leaf, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export function WelcomePage() {
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
            <h1>У мечты есть своя копилка.</h1>
            <p>
              Копить на мечту, выбирать с умом и делать добро.
              <br className="desktop-only" /> Три отсека — целый мир открытий.
            </p>
          </div>
          <div className="welcome-jars">
            {(['save', 'spend', 'help'] as const).map((category, i) => (
              <div className={`welcome-jar ${category}`} key={category}>
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
