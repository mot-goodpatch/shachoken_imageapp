import { Redis } from '@upstash/redis'
import { v4 as uuidv4 } from 'uuid'
import { Submission, SubmitRequest } from '@/types'

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return _redis
}

const KEY = 'submissions'

async function read(): Promise<Submission[]> {
  const data = await getRedis().get<Submission[]>(KEY)
  return data ?? []
}

async function write(submissions: Submission[]): Promise<void> {
  await getRedis().set(KEY, submissions)
}

export async function saveSubmission(req: SubmitRequest): Promise<Submission> {
  const submissions = await read()
  const entry: Submission = {
    id: uuidv4(),
    name: req.name,
    keyword: req.keyword,
    prompt: req.prompt,
    imageUrl: req.imageUrl,
    rating: req.rating ?? null,
    comment: req.comment || null,
    pageTitle: req.pageTitle,
    roomId: req.roomId,
    createdAt: new Date().toISOString(),
  }
  await write([...submissions, entry])
  return entry
}

export async function getAllSubmissions(): Promise<Submission[]> {
  return read()
}

export async function deleteSubmission(id: string): Promise<void> {
  const submissions = await read()
  const target = submissions.find((s) => s.id === id)
  if (!target) return

  if (target.imageUrl.includes('blob.vercel-storage.com')) {
    const { del } = await import('@vercel/blob')
    await del(target.imageUrl).catch(() => {})
  }

  await write(submissions.filter((s) => s.id !== id))
}
