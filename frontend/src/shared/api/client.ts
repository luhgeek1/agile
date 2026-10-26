export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: options.signal ?? AbortSignal.timeout(12000),
    })
  } catch {
    throw new ApiError(0, 'Нет связи с копилкой. Проверьте подключение и попробуйте ещё раз.')
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      typeof data.detail === 'string'
        ? data.detail
        : 'Не удалось выполнить действие. Попробуйте ещё раз.',
    )
  }
  return response.json()
}
