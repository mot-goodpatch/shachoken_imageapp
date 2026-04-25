import { notFound } from 'next/navigation'
import { getRoomByToken } from '@/lib/rooms'
import { getAllSubmissions } from '@/lib/storage'
import RoomAdminClient from './RoomAdminClient'

export const dynamic = 'force-dynamic'

export default async function RoomAdminPage({
  params,
}: {
  params: Promise<{ adminToken: string }>
}) {
  const { adminToken } = await params
  const room = await getRoomByToken(adminToken)
  if (!room) notFound()

  const all = await getAllSubmissions()
  const submissions = all.filter((s) => s.roomId === room.id).reverse()

  return <RoomAdminClient room={room} initialSubmissions={submissions} />
}
