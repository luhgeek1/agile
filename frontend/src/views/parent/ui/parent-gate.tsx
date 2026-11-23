'use client'

import { api, ApiError } from '@/shared/api'
import { Button, Card, ErrorState, FieldError, Loading, Page } from '@/shared/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type MouseEvent, type PropsWithChildren } from 'react'

type ParentStatus = { configured: boolean; unlocked: boolean }
const queryKey = ['parent-access']

export function ParentGate({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const status = useQuery({
    queryKey,
    queryFn: ({ signal }) => api<ParentStatus>('/demo/parent', { signal }),
    gcTime: 0,
    refetchInterval: 15_000,
    retry: false,
  })
  const [pin, setPin] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [validation, setValidation] = useState('')
  const unlock = useMutation({
    mutationFn: (setup: boolean) =>
      api<ParentStatus>('/demo/parent', { method: 'POST', body: JSON.stringify({ pin, setup }) }),
    onSuccess: async (data) => {
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData(queryKey, data)
      setPin('')
      setConfirmation('')
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) void status.refetch()
    },
  })
  const lock = useMutation<unknown, Error, string>({
    mutationFn: () => api('/demo/parent', { method: 'DELETE' }),
    onSuccess: async (_, destination) => {
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData(queryKey, { configured: true, unlocked: false })
      router.replace(destination)
    },
  })

  if (status.isPending) return <Loading />
  if (status.isError) {
    return (
      <Page>
        <ErrorState message={status.error.message} retry={() => void status.refetch()} />
        <Link className="text-link" href="/">
          К выбору режима
        </Link>
      </Page>
    )
  }
  if (status.data.unlocked) {
    function leaveThroughLink(event: MouseEvent<HTMLDivElement>) {
      const link = (event.target as HTMLElement).closest('a')
      const href = link?.getAttribute('href')
      if (!href?.startsWith('/app') || href.startsWith('/app/parent')) return
      event.preventDefault()
      if (!lock.isPending) lock.mutate(href)
    }
    return (
      <>
        <div className="parent-session-bar">
          <span>Режим родителя</span>
          <Button variant="secondary" busy={lock.isPending} onClick={() => lock.mutate('/app')}>
            <LockKeyhole size={17} aria-hidden="true" /> Закрыть и выйти в копилку
          </Button>
          <FieldError message={lock.error?.message} />
        </div>
        <div onClickCapture={leaveThroughLink}>{children}</div>
      </>
    )
  }

  const setup = !status.data.configured
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^[0-9]{4}$/.test(pin)) {
      setValidation('Введите четыре цифры.')
      return
    }
    if (setup && pin !== confirmation) {
      setValidation('PIN-коды должны совпадать.')
      return
    }
    setValidation('')
    unlock.mutate(setup)
  }

  return (
    <Page className="parent-gate">
      <Card>
        <LockKeyhole className="parent-gate-icon" size={28} aria-hidden="true" />
        <h1>Родительский режим</h1>
        <p>
          {setup
            ? 'Взрослому нужно придумать PIN для входа в кабинет.'
            : 'Введите родительский PIN.'}
        </p>
        <form className="form-stack" onSubmit={submit}>
          <label>
            {setup ? 'Новый PIN' : 'PIN'}
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoComplete={setup ? 'new-password' : 'current-password'}
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />
          </label>
          {setup && (
            <label>
              Повторите PIN
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </label>
          )}
          <FieldError message={validation || unlock.error?.message} />
          <Button type="submit" busy={unlock.isPending}>
            {setup ? 'Создать PIN и войти' : 'Войти'}
          </Button>
        </form>
        <Link className="text-link" href="/app">
          <ArrowLeft size={17} aria-hidden="true" /> В копилку
        </Link>
      </Card>
    </Page>
  )
}
