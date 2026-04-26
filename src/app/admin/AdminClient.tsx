'use client'

import { useState, useEffect } from 'react'
import { Submission } from '@/types'

interface Props {
  submissions: Submission[]
}

export default function AdminClient({ submissions: initial }: Props) {
  const [submissions, setSubmissions] = useState(initial)
  const [titleInput, setTitleInput] = useState('')
  const [origin, setOrigin] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const shareUrl = titleInput.trim()
    ? `${origin}/?title=${encodeURIComponent(titleInput.trim())}`
    : ''

  const handleCopy = async (url: string, key: string) => {
    await navigator.clipboard.writeText(url)
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

  const grouped = submissions.reduce<Record<string, Submission[]>>((acc, s) => {
    const key = s.pageTitle ?? '（タイトルなし）'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const groups = Object.entries(grouped).sort(
    ([, a], [, b]) =>
      new Date(b[0].createdAt).getTime() - new Date(a[0].createdAt).getTime()
  )

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 md:px-12 py-14">

        <header className="mb-14">
          <h1 className="text-3xl font-medium tracking-wider text-zinc-900">Metapatch</h1>
        </header>

        {/* URL 発行 */}
        <section className="mb-16">
          <h2 className="text-xs text-[#0066cc] tracking-widest mb-8">ルームを作成</h2>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="質問タイトルを入力"
              className="flex-1 px-4 py-2.5 bg-zinc-100 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
            <button
              onClick={() => handleCopy(shareUrl, '__new__')}
              disabled={!shareUrl}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] ${
                shareUrl
                  ? copiedKey === '__new__'
                    ? 'bg-zinc-200 text-zinc-500'
                    : 'bg-[#0066cc] text-white hover:bg-[#0052a3]'
                  : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
              }`}
            >
              {copiedKey === '__new__' ? 'コピーしました' : 'URLをコピー'}
            </button>
          </div>
          {shareUrl && (
            <p className="mt-2.5 px-1 text-[11px] text-zinc-400 font-mono break-all">
              {shareUrl}
            </p>
          )}
        </section>

        {/* タイトル別一覧 */}
        <section>
          <h2 className="text-xs text-[#0066cc] tracking-widest mb-8">ルーム別 送信画像</h2>

          {groups.length === 0 ? (
            <p className="text-zinc-300 text-sm">まだ送信された画像はありません</p>
          ) : (
            <div className="space-y-12">
              {groups.map(([title, items]) => {
                const groupUrl = title !== '（タイトルなし）'
                  ? `${origin}/?title=${encodeURIComponent(title)}`
                  : null
                return (
                  <div key={title}>
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <h3 className="text-base font-medium text-zinc-900">{title}</h3>
                          <span className="text-xs text-zinc-400">{items.length}件</span>
                        </div>
                        {groupUrl && (
                          <p className="mt-1 text-[11px] text-zinc-400 font-mono break-all">{groupUrl}</p>
                        )}
                      </div>
                      {groupUrl && (
                        <button
                          onClick={() => handleCopy(groupUrl, title)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
                            copiedKey === title
                              ? 'bg-zinc-200 text-zinc-500'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                        >
                          {copiedKey === title ? 'コピーしました' : 'URLをコピー'}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {items.map((s) => (
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
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
