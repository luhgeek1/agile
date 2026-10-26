import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import type { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'

import { ErrorBoundary } from './error-boundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: true, retry: 1 },
    mutations: { retry: false },
  },
})

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.22 }}>
          <BrowserRouter>{children}</BrowserRouter>
          <Toaster
            position="top-center"
            richColors
            closeButton
            containerAriaLabel="Уведомления"
            toastOptions={{ className: 'app-toast' }}
          />
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
