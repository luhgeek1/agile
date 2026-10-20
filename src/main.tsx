import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'
import '@fontsource-variable/nunito/wght.css'
import '@fontsource-variable/nunito-sans/wght.css'
import './styles.css'
import App from './app'
import { ErrorBoundary } from './components/error-boundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: true, retry: 1 },
    mutations: { retry: false },
  },
})
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.22 }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
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
  </React.StrictMode>,
)
