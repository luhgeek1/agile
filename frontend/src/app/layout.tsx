import type { Metadata, Viewport } from 'next'
import type { PropsWithChildren } from 'react'
import { AppProviders } from './providers/app-providers'
import './styles/index.css'
import './styles/child-experience.css'
import '@fontsource-variable/nunito-sans/wght.css'
import '@fontsource-variable/nunito/wght.css'

export const metadata: Metadata = {
  title: {
    default: 'Коплю — Трачу — Помогаю · Моя копилка',
    template: '%s · Коплю — Трачу — Помогаю',
  },
  description:
    'Коплю — Трачу — Помогаю. Три маленькие привычки для больших открытий. Образовательная копилка для детей и родителей.',
  icons: { icon: '/favicon.svg' },
}
export const viewport: Viewport = { themeColor: '#F6F8F6' }

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
