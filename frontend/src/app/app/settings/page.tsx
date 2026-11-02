import type { Metadata } from 'next'
import { SettingsPage } from '@/views/settings'

export const metadata: Metadata = { title: 'Настройки и справка' }

export default function Page() {
  return <SettingsPage />
}
