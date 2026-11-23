import type { Metadata, Viewport } from 'next'
import type { PropsWithChildren } from 'react'
import { AppProviders } from './providers/app-providers'
import './styles/index.css'
import './styles/child-experience.css'
import './styles/refinement.css'
import './styles/goals.css'
import './styles/activities.css'
import './styles/home-tasks.css'
import './styles/history.css'
import './styles/welcome.css'
import '@fontsource-variable/nunito-sans/wght.css'
import '@fontsource-variable/nunito/wght.css'

export const metadata: Metadata = {
  title: {
    default: 'Коплю — Трачу — Помогаю · Моя копилка',
    template: '%s · Коплю — Трачу — Помогаю',
  },
  description: 'Коплю — Трачу — Помогаю. Копилка и задания о деньгах для детей 6–10 лет.',
  icons: { icon: '/brand/favicon.png' },
}
export const viewport: Viewport = { themeColor: '#F7F2E8' }

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
