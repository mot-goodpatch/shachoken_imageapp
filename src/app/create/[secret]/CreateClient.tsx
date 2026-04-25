'use client'

import { useState, useEffect } from 'react'
import { Room } from '@/types'

export default function CreateClient() {
  const [titleInput, setTitleInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [origin, setOrigin] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const shareUrl = room ? `${origin}/?room=${room.id}` : ''
  const adminUrl = room ? `${origin}/admin/${room.adminToken}` : ''

  const handleCreate = async () => {
    if (!titleInput.trim() || isCreating) return
    setIsCreating(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRoom(data)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-8 py-24">
        <header className="mb-16">
          <h1 className="text-3xl font-medium tracking-wider text-zinc-900 mb-2">ルームを作成</h1>
          <p className="text-sm text-zinc-400">タイトルを入力して、参加URLと管理URLを発行します</p>
        </header>

        {!room ? (
          <div className="space-y-4">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="株式会社グッドパッチを何かに例えると？"
              autoFocus
              className="w-full px-4 py-3 bg-zinc-100 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              disabled={!titleInput.trim() || isCreating}
              className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-[#0066cc] hover:bg-[#0052a3] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {isCreating ? '作成中...' : '作成する'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <p className="text-xs text-zinc-400 tracking-widest mb-1">タイトル</p>
              <p className="text-base font-medium text-zinc-900">{room.title}</p>
            </div>

            {/* 参加URL */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 tracking-widest">参加URL（みんなに共有）</p>
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
            </div>

            {/* 管理URL */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 tracking-widest">管理URL（自分だけ保管）</p>
              <div className="flex gap-3 items-center">
                <p className="flex-1 px-4 py-2.5 bg-zinc-100 rounded-lg text-xs font-mono text-zinc-600 break-all">
                  {adminUrl}
                </p>
                <button
                  onClick={() => handleCopy(adminUrl, 'admin')}
                  className={`shrink-0 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] ${
                    copiedKey === 'admin'
                      ? 'bg-zinc-200 text-zinc-500'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {copiedKey === 'admin' ? 'コピーしました' : 'コピー'}
                </button>
              </div>
              <p className="text-[11px] text-red-400 px-1">※ このURLを知っている人だけが管理できます。大切に保管してください。</p>
            </div>

            <button
              onClick={() => { setRoom(null); setTitleInput('') }}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              別のルームを作成 →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
