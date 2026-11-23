import { redirect } from 'next/navigation'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; kind?: string }>
}) {
  const { category, kind } = await searchParams
  const params = new URLSearchParams()
  if (typeof category === 'string') params.set('category', category)
  if (typeof kind === 'string') params.set('kind', kind)
  redirect(`/app${params.size ? `?${params}` : ''}#recent`)
}
