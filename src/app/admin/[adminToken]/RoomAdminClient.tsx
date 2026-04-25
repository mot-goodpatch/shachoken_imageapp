'use client'

import { useState, useEffect } from 'react'
import { Submission, Room } from '@/types'

interface Props {
  room: Room
  initialSubmissions: Submission[]
}

export default function RoomAdminClient({ room, initialSubmissions }: Props) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const shareUrl = `${origin}/?room=${room.id}`

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この画像を削除しますか？')) return
    setDeletingId(id)
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' })
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 md:px-12 py-14">

        <header className="mb-14">
          <p className="text-sm text-zinc-400 tracking-wide mb-1">管理</p>
          <h1 className="text-3xl font-medium tracking-wider text-zinc-900">{room.title}</h1>
        </header>

        {/* 参加URL */}
        <section className="mb-14">
          <h2 className="text-xs text-zinc-400 tracking-widest mb-3">参加URL</h2>
          <div className="flex gap-3 items-center">
            <p className="flex-1 px-4 py-2.5 bg-zinc-100 rounded-lg text-xs font-mono text-zinc-600 break-all">
              {shareUrl}
            </p>
            <button
              onClick={() => handleCopy(shareUrl, 'share')}
              className={`shrink-0 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
                copiedKey === 'share'
                  ? 'bg-zinc-200 text-zinc-500'
                  : 'bg-[#0066cc] text-white hover:bg-[#0052a3]'
              }`}
            >
              {copiedKey === 'share' ? 'コピーしました' : 'コピー'}
            </button>
          </div>
        </section>

        {/* 送信済み画像 */}
        <section>
          <div className="flex items-baseline gap-3 mb-8">
            <h2 className="text-xs text-zinc-400 tracking-widest">送信済みの画像</h2>
            <span className="text-xs text-zinc-300">{submissions.length}件</span>
          </div>

          {submissions.length === 0 ? (
            <p className="text-zinc-300 text-sm">まだ送信された画像はありません</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="relative bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="w-full aspect-square object-cover bg-white"
                  />
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/30 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 disabled:opacity-50 transition-all"
                    title="削除"
                  >
                    {deletingId === s.id ? '…' : '×'}
                  </button>
                  <div className="px-3 py-3 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-medium text-zinc-900 truncate">{s.name}</p>
                      {s.rating && (
                        <p className="text-[10px] text-[#0066cc] shrink-0">{'★'.repeat(s.rating)}</p>
                      )}
                    </div>
                    {s.keyword && (
                      <p className="text-xs text-zinc-500 truncate">{s.keyword}</p>
                    )}
                    {s.comment && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{s.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
