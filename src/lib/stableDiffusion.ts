import { put } from '@vercel/blob'
import sharp from 'sharp'
import { GenerateRequest, GenerateResponse } from '@/types'
import { buildPrompt, getNegativePrompt, STYLE_CONFIG } from './promptBuilder'

const IS_MOCK = process.env.SD_MOCK === 'true'

// 背景を純白化: ブースト+ブラーでソフトなマスクを生成し、マスクが背景と判定した
// ピクセルのみ元画像を純白に置換する。これによりエッジが滑らかになり影の汚れも消える。
async function normalizeBackground(buffer: Buffer): Promise<Buffer> {
  const THRESHOLD = 235

  const { width, height } = await sharp(buffer).metadata()
  if (!width || !height) return buffer

  const origRaw = await sharp(buffer).ensureAlpha().raw().toBuffer()

  // 明るさを増幅してから少しぼかすことで、背景の薄影・ノイズをまとめて検出できるマスクを作る
  const maskRaw = await sharp(buffer)
    .linear(1.2, 20)
    .blur(2)
    .ensureAlpha()
    .raw()
    .toBuffer()

  for (let i = 0; i < origRaw.length; i += 4) {
    const mr = maskRaw[i], mg = maskRaw[i + 1], mb = maskRaw[i + 2]
    if (mr >= THRESHOLD && mg >= THRESHOLD && mb >= THRESHOLD) {
      origRaw[i] = 255; origRaw[i + 1] = 255; origRaw[i + 2] = 255
    }
  }

  return sharp(origRaw, { raw: { width, height, channels: 4 } })
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
  const buffer = await normalizeBackground(raw)
  const filename = `generated/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
  const imageUrl = await saveImage(buffer, filename)
  const seed = Math.floor(Math.random() * 2_147_483_647)

  return { imageUrl, prompt, seed }
}
