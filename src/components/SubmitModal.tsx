'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  imageUrl: string
  prompt: string
  keyword: string
  pageTitle: string
  roomId?: string
  onClose: () => void
  onSuccess: () => void
}

export default function SubmitModal({ imageUrl, prompt, keyword, pageTitle, roomId, onClose, onSuccess }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          imageUrl,
          prompt,
          keyword,
          pageTitle,
          roomId,
          rating: rating || null,
          comment: comment.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '送信に失敗しました')

      onSuccess()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-6"
      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl animate-fadeIn">
        {success ? (
          /* 送信完了 */
          <div className="px-8 py-12 text-center space-y-8">
            <div>
              <div className="text-4xl mb-4">🎉</div>
              <p className="font-semibold text-zinc-900 tracking-wide">送信しました！</p>
              <p className="text-sm text-zinc-400 mt-1.5">ありがとうございます</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(roomId ? `/gallery?room=${roomId}` : `/gallery?title=${encodeURIComponent(pageTitle)}`)}
                className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-[#0066cc] hover:bg-[#0052a3] active:scale-[0.98] transition-all"
              >
                みんなの画像を見る →
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg font-semibold text-sm text-zinc-500 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.98] transition-all"
              >
                Topに戻る
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-8 pt-8 pb-6">
              <h2 className="text-base font-medium tracking-wide text-zinc-900">結果を送信</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-300 hover:text-zinc-500 w-7 h-7 flex items-center justify-center transition-colors text-xl leading-none"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>

            <div className="px-8 pb-8 space-y-6">
              {/* 名前 */}
              <div>
                <label className="block text-xs text-zinc-400 tracking-widest mb-2.5">
                  名前 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="田中"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 bg-zinc-100 border-0 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none transition"
                />
              </div>

              {/* 満足度 */}
              <div>
                <label className="block text-xs text-zinc-400 tracking-widest mb-2.5">
                  満足度 <span className="text-zinc-300 font-normal">(任意)</span>
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(rating === star ? 0 : star)}
                      className="text-2xl leading-none transition-transform hover:scale-110 active:scale-95"
                    >
                      {star <= rating
                        ? <span className="text-[#0066cc]">★</span>
                        : <span className="text-zinc-200">★</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* コメント */}
              <div>
                <label className="block text-xs text-zinc-400 tracking-widest mb-2.5">
                  コメント <span className="text-zinc-300 font-normal">(任意)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="生成された画像についての感想や、補足があれば教えてください！"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-zinc-100 border-0 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none resize-none transition"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-150 ${
                  name.trim() && !isSubmitting
                    ? 'bg-[#0066cc] text-white hover:bg-[#0052a3] active:scale-[0.98]'
                    : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
