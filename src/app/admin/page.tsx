import type { Metadata } from 'next'
import { getAllSubmissions } from '@/lib/storage'
import AdminClient from './AdminClient'

export const metadata: Metadata = { title: 'Metapatch' }

export default async function AdminPage() {
  const submissions = await getAllSubmissions()
  return <AdminClient submissions={submissions} />
}
