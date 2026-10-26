import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export function useSave<T>(path: string, method = 'POST') {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (data: T) => api(path, { method, body: JSON.stringify(data) }),
    onSuccess: async () => {
      await client.invalidateQueries()
    },
  })
}
