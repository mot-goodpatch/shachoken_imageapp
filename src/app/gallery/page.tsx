import Link from 'next/link'
import { getAllSubmissions } from '@/lib/storage'
import GalleryClient from './GalleryClient'

export const dynamic = 'force-dynamic'

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; room?: string }>
}) {
  const { title, room: roomId } = await searchParams
  const allSubmissions = await getAllSubmissions()
  const filtered = roomId
    ? allSubmissions.filter((s) => s.roomId === roomId)
    : title
      ? allSubmissions.filter((s) => s.pageTitle === title)
      : allSubmissions
  const sorted = [...filtered].reverse()
  const displayTitle = title ?? (sorted[0]?.pageTitle ?? null)
  const backHref = roomId ? `/?room=${roomId}` : title ? `/?title=${encodeURIComponent(title)}` : '/'

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 md:px-12 py-14">
        <header className="mb-14">
          <Link
            href={backHref}
            className="text-xs text-zinc-300 hover:text-zinc-500 tracking-wide transition-colors mb-8 inline-block"
          >
            ← 戻る
          </Link>
          <div className="space-y-1">
            <p className="text-sm text-zinc-400 tracking-wide">送信済みの画像</p>
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl font-medium tracking-wider text-zinc-900">
                {displayTitle ?? 'みんなの画像'}
              </h1>
              <span className="text-sm text-zinc-300 tracking-wide">{sorted.length}件</span>
            </div>
          </div>
        </header>

        <GalleryClient initialSubmissions={sorted} />
      </div>
    </main>
  )
}
