'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Submission } from '@/types'

export default function GalleryClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [canView, setCanView] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const submitted = localStorage.getItem('shachoken_submitted')
    setCanView(submitted === 'true')
    setChecking(false)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('この画像を削除しますか？')) return
    setDeletingId(id)
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' })
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
  }

  if (checking) return null

  if (!canView) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-zinc-400 text-sm tracking-wide">先に画像を生成・送信してください</p>
        <Link href="/" className="inline-block text-xs text-[#0066cc] hover:opacity-70 tracking-wide transition-opacity">
          ← Topに戻る
        </Link>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-24 text-zinc-300 text-sm tracking-wide">
        まだ送信された画像はありません
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {submissions.map((s) => (
        <div
          key={s.id}
          className="relative bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.imageUrl}
            alt={s.name}
            className="w-full aspect-square object-contain bg-white"
          />

          {/* 削除ボタン（ホバーで表示） */}
          <button
            onClick={() => handleDelete(s.id)}
            disabled={deletingId === s.id}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/30 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 disabled:opacity-50 transition-all"
            title="削除"
          >
            {deletingId === s.id ? '…' : '×'}
          </button>

          <div className="px-4 py-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-zinc-900 text-sm truncate">{s.name}</p>
              {s.rating && (
                <p className="text-xs text-[#0066cc] shrink-0">{'★'.repeat(s.rating)}</p>
              )}
            </div>
            {s.keyword && (
              <p className="text-sm text-zinc-600 tracking-wide">{s.keyword}</p>
            )}
            {s.comment && (
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{s.comment}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
