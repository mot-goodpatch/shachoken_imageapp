import { put } from '@vercel/blob'
import { GenerateRequest, GenerateResponse } from '@/types'
import { buildPrompt } from './promptBuilder'

const IS_MOCK = process.env.SD_MOCK === 'true'

async function saveImage(buffer: Buffer, filename: string): Promise<string> {
  const blob = await put(filename, buffer, { access: 'public' })
  return blob.url
}

async function callPollinations(prompt: string): Promise<Buffer> {
  const seed = Math.floor(Math.random() * 2_147_483_647)
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&nologo=true&private=true&seed=${seed}`

  console.log('[generate] calling pollinations:', prompt)
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) })

  if (!res.ok) {
    throw new Error(`Pollinations API エラー: ${res.status}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

export async function generateImage(request: GenerateRequest): Promise<GenerateResponse> {
  const prompt = await buildPrompt(request.modifier, request.connector, request.object, request.style, request.note)

  if (IS_MOCK) {
    return { imageUrl: 'https://placehold.co/1024x1024/ffffff/999?text=MOCK', prompt, seed: -1 }
  }

  console.log('[generate] prompt:', prompt)
  const buffer = await callPollinations(prompt)
  const filename = `generated/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
  const imageUrl = await saveImage(buffer, filename)
  const seed = Math.floor(Math.random() * 2_147_483_647)

  return { imageUrl, prompt, seed }
}
