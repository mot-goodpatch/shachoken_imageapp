import { put } from '@vercel/blob'
import { GenerateRequest, GenerateResponse } from '@/types'
import { buildPrompt, getNegativePrompt, STYLE_CONFIG } from './promptBuilder'

const IS_MOCK = process.env.SD_MOCK === 'true'

async function saveImage(buffer: Buffer, filename: string): Promise<string> {
  const blob = await put(filename, buffer, { access: 'public' })
  return blob.url
}

async function callPollinations(prompt: string, negative: string, model: string): Promise<Buffer> {
  const seed = Math.floor(Math.random() * 2_147_483_647)
  const params = new URLSearchParams({
    width: '1024',
    height: '1024',
    model,
    nologo: 'true',
    private: 'true',
    seed: String(seed),
    negative,
  })
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`

  console.log('[generate] calling pollinations:', prompt)
  const res = await fetch(url, { signal: AbortSignal.timeout(55_000) })

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

  const negative = getNegativePrompt(request.style)
  const model = request.style ? (STYLE_CONFIG[request.style]?.model ?? 'flux') : 'flux'

  console.log('[generate] prompt:', prompt)
  console.log('[generate] negative:', negative)
  console.log('[generate] model:', model)
  const raw = await callPollinations(prompt, negative, model)
  const filename = `generated/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
  const imageUrl = await saveImage(raw, filename)
  const seed = Math.floor(Math.random() * 2_147_483_647)

  return { imageUrl, prompt, seed }
}
