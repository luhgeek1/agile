import { App, AppProviders } from '@/app'
import '@/app/styles/index.css'
import '@/app/styles/child-experience.css'
import '@fontsource-variable/nunito-sans/wght.css'
import '@fontsource-variable/nunito/wght.css'
import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
