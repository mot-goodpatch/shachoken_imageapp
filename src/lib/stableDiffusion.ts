import { put } from '@vercel/blob'
import sharp from 'sharp'
import { GenerateRequest, GenerateResponse } from '@/types'
import { buildPrompt, getNegativePrompt, STYLE_CONFIG } from './promptBuilder'

const IS_MOCK = process.env.SD_MOCK === 'true'

// 背景を純白化: 四辺からフラッドフィルで「画像境界と連結した明るいピクセル」を背景と判定し
// 純白に置換する。被写体の暗いシルエット端が壁になるため、内部の白は保持される。
async function normalizeBackground(buffer: Buffer): Promise<Buffer> {
  const THRESHOLD = 220

  const { width, height } = await sharp(buffer).metadata()
  if (!width || !height) return buffer

  const raw = await sharp(buffer).ensureAlpha().raw().toBuffer()
  const isBg = new Uint8Array(width * height)
  const stack: number[] = []

  const isBright = (px: number): boolean => {
    const i = px * 4
    return raw[i] >= THRESHOLD && raw[i + 1] >= THRESHOLD && raw[i + 2] >= THRESHOLD
  }

  const seed = (px: number) => {
    if (!isBg[px] && isBright(px)) { isBg[px] = 1; stack.push(px) }
  }

  // 四辺から明るいピクセルを起点としてフィルを開始
  for (let x = 0; x < width; x++) { seed(x); seed((height - 1) * width + x) }
  for (let y = 1; y < height - 1; y++) { seed(y * width); seed(y * width + width - 1) }

  while (stack.length) {
    const px = stack.pop()!
    const x = px % width, y = Math.floor(px / width)
    if (x > 0)        seed(px - 1)
    if (x < width - 1) seed(px + 1)
    if (y > 0)        seed(px - width)
    if (y < height - 1) seed(px + width)
  }

  for (let i = 0; i < width * height; i++) {
    if (isBg[i]) {
      const ri = i * 4
      raw[ri] = 255; raw[ri + 1] = 255; raw[ri + 2] = 255
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
