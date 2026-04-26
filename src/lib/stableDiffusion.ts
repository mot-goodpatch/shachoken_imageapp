import { put } from '@vercel/blob'
import sharp from 'sharp'
import { GenerateRequest, GenerateResponse } from '@/types'
import { buildPrompt, getNegativePrompt, STYLE_CONFIG } from './promptBuilder'

const IS_MOCK = process.env.SD_MOCK === 'true'

// 閾値(240/255)以上の明るさのピクセルを純白 #ffffff に置換する
async function normalizeBackground(buffer: Buffer): Promise<Buffer> {
  const THRESHOLD = 240
  const img = sharp(buffer)
  const { width, height } = await img.metadata()
  if (!width || !height) return buffer

  const raw = await img.ensureAlpha().raw().toBuffer()
  for (let i = 0; i < raw.length; i += 4) {
    const r = raw[i], g = raw[i + 1], b = raw[i + 2]
    if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
      raw[i] = 255; raw[i + 1] = 255; raw[i + 2] = 255
    }
  }
  return sharp(raw, { raw: { width, height, channels: 4 } })
    .jpeg({ quality: 95 })
    .toBuffer()
}

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

  const negative = getNegativePrompt(request.style)
  const model = request.style ? (STYLE_CONFIG[request.style]?.model ?? 'flux') : 'flux'

  console.log('[generate] prompt:', prompt)
  console.log('[generate] negative:', negative)
  console.log('[generate] model:', model)
  const raw = await callPollinations(prompt, negative, model)
  const buffer = await normalizeBackground(raw)
  const filename = `generated/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
  const imageUrl = await saveImage(buffer, filename)
  const seed = Math.floor(Math.random() * 2_147_483_647)

  return { imageUrl, prompt, seed }
}
