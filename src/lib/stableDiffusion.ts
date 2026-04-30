import { put } from '@vercel/blob'
import { GenerateRequest, GenerateResponse } from '@/types'
import { buildPrompt, getNegativePrompt, STYLE_CONFIG } from './promptBuilder'

const IS_MOCK = process.env.SD_MOCK === 'true'

async function saveImage(buffer: Buffer, filename: string): Promise<string> {
  const blob = await put(filename, buffer, { access: 'public' })
  return blob.url
}

const POLLINATIONS_TIMEOUT_MS = 20_000
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 3_000

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

  let lastError: Error | null = null
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[generate] calling pollinations (attempt ${attempt}/${MAX_RETRIES}):`, prompt)
      const res = await fetch(url, { signal: AbortSignal.timeout(POLLINATIONS_TIMEOUT_MS) })
      if (!res.ok) {
        const err = new Error(`Pollinations API エラー: ${res.status}`)
        ;(err as NodeJS.ErrnoException).code = String(res.status)
        throw err
      }
      return Buffer.from(await res.arrayBuffer())
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const isTimeout = lastError.name === 'TimeoutError' || lastError.name === 'AbortError'
      const is429 = (lastError as NodeJS.ErrnoException).code === '429'
      console.warn(`[generate] attempt ${attempt} failed (${lastError.name}): ${lastError.message}`)
      if (attempt === MAX_RETRIES) break
      if (isTimeout || is429) {
        const delay = is429 ? RETRY_DELAY_MS * attempt : RETRY_DELAY_MS
        console.log(`[generate] waiting ${delay}ms before retry...`)
        await sleep(delay)
      } else {
        break
      }
    }
  }
  throw lastError!
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
