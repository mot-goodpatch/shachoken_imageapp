import { NextRequest, NextResponse } from 'next/server'
import { createRoom } from '@/lib/rooms'

export async function POST(request: NextRequest) {
  const { title } = await request.json().catch(() => ({}))
  if (!title?.trim()) {
    return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
  }
  const room = await createRoom(title.trim())
  return NextResponse.json(room)
}
