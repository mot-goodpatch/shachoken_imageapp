import type { Metadata } from 'next'
import { getRoomById } from '@/lib/rooms'
import HomeClient from './HomeClient'

const DEFAULT_TITLE = '株式会社グッドパッチを何かに例えると？'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; room?: string }>
}): Promise<Metadata> {
  const { title, room: roomId } = await searchParams
  if (roomId) {
    const room = await getRoomById(roomId)
    if (room) return { title: room.title }
  }
  return { title: title ?? DEFAULT_TITLE }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; room?: string }>
}) {
  const { title, room: roomId } = await searchParams

  let titleJa = title ?? DEFAULT_TITLE
  let resolvedRoomId: string | undefined

  if (roomId) {
    const room = await getRoomById(roomId)
    if (room) {
      titleJa = room.title
      resolvedRoomId = room.id
    }
  }

  return <HomeClient titleJa={titleJa} roomId={resolvedRoomId} />
}
