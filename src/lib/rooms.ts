import { Redis } from '@upstash/redis'
import { v4 as uuidv4 } from 'uuid'
import { Room } from '@/types'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const KEY = 'rooms'

async function read(): Promise<Room[]> {
  const data = await redis.get<Room[]>(KEY)
  return data ?? []
}

async function write(rooms: Room[]): Promise<void> {
  await redis.set(KEY, rooms)
}

export async function createRoom(title: string): Promise<Room> {
  const rooms = await read()
  const id = Math.random().toString(36).slice(2, 10)
  const adminToken = uuidv4().replace(/-/g, '')
  const room: Room = { id, adminToken, title, createdAt: new Date().toISOString() }
  await write([...rooms, room])
  return room
}

export async function getRoomById(id: string): Promise<Room | null> {
  const rooms = await read()
  return rooms.find((r) => r.id === id) ?? null
}

export async function getRoomByToken(adminToken: string): Promise<Room | null> {
  const rooms = await read()
  return rooms.find((r) => r.adminToken === adminToken) ?? null
}
