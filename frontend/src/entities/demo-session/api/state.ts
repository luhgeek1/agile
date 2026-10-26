import { api } from '@/shared/api'
import type { AppState } from '@/shared/api/contracts'
import { useQuery } from '@tanstack/react-query'

export const useAppState = () =>
  useQuery({
    queryKey: ['state'],
    queryFn: () => api<AppState>('/state'),
    retry: false,
    staleTime: 15000,
  })
