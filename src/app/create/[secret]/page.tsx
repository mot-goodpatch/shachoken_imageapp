import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CreateClient from './CreateClient'

export const metadata: Metadata = { title: 'ルームを作成' }

export default async function CreatePage({
  params,
}: {
  params: Promise<{ secret: string }>
}) {
  const { secret } = await params
  if (secret !== process.env.CREATE_SECRET) notFound()
  return <CreateClient />
}
