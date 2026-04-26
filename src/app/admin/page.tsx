import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllSubmissions } from '@/lib/storage'
import AdminClient from './AdminClient'

export const metadata: Metadata = { title: 'Metapatch' }

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>
}) {
  const { secret } = await searchParams
  if (secret !== process.env.ADMIN_SECRET) notFound()

  const submissions = await getAllSubmissions()
  return <AdminClient submissions={submissions} />
}
