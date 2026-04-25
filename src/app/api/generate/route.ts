import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
import { generateImage } from '@/lib/stableDiffusion'
import { GenerateRequest } from '@/types'

export async function POST(request: NextRequest) {
  let body: GenerateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 })
  }

  if (!body.modifier?.trim() || !body.object?.trim() || !body.connector) {
    return NextResponse.json({ error: '修飾語・物体・接続語は必須です' }, { status: 400 })
  }

  try {
    const result = await generateImage(body)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[generate] ERROR:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
