import { NextRequest, NextResponse } from 'next/server'
import { saveSubmission } from '@/lib/storage'
import { SubmitRequest } from '@/types'

export async function POST(request: NextRequest) {
  let body: SubmitRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が不正です' }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: '名前は必須です' }, { status: 400 })
  }

  try {
    const submission = await saveSubmission(body)
    return NextResponse.json(submission)
  } catch (err) {
    console.error('[submit]', err)
    return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 })
  }
}
