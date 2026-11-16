'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { useState, type PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

import { ErrorBoundary } from './error-boundary'

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: true, retry: 1 },
          mutations: { retry: false },
        },
      }),
  )
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.22 }}>
          {children}
          <Toaster
            position="bottom-right"
            offset={{ bottom: 'var(--toast-bottom, 24px)', right: 24 }}
            mobileOffset={{ bottom: 'var(--toast-bottom, 24px)', left: 16, right: 16 }}
            closeButton
            containerAriaLabel="Уведомления"
            toastOptions={{ className: 'app-toast', closeButtonAriaLabel: 'Закрыть уведомление' }}
          />
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
