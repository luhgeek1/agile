export function parseMoney(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(normalized)) return null
  const [rubles, kopeks = ''] = normalized.split('.')
  const result = Number(rubles) * 100 + Number(kopeks.padEnd(2, '0'))
  return Number.isSafeInteger(result) && result > 0 && result <= 100_000_000 ? result : null
}
export const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: value % 100 === 0 ? 0 : 2,
  }).format(value / 100)
export const moneyInput = (value: number) =>
  `${Math.trunc(value / 100)}${value % 100 ? `,${String(value % 100).padStart(2, '0')}` : ''}`
export const today = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Moscow' }).format(new Date())
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Moscow',
  }).format(new Date(value.length === 10 ? `${value}T12:00:00+03:00` : value))
