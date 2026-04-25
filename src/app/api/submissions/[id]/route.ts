import { NextRequest, NextResponse } from 'next/server'
import { deleteSubmission } from '@/lib/storage'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteSubmission(id)
  return NextResponse.json({ ok: true })
}
