import { ActivitiesPage } from '@/pages/activities'
import { FeedbackPage } from '@/pages/feedback'
import { GoalsPage } from '@/pages/goals'
import { HistoryPage } from '@/pages/history'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'
import { ParentPage } from '@/pages/parent'
import { SettingsPage } from '@/pages/settings'
import { WelcomePage } from '@/pages/welcome'
import { ProductLayout } from '@/widgets/product-shell'
import { Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/app" element={<ProductLayout />}>
        <Route index element={<HomePage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="transactions" element={<HistoryPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="parent" element={<ParentPage />} />
        <Route path="parent/feedback" element={<FeedbackPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
