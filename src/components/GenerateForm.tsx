'use client'

import { useState } from 'react'
import { GenerateRequest } from '@/types'

interface Props {
  onGenerate: (request: GenerateRequest) => void
  onSubmit: (keyword: string) => void
  isGenerating: boolean
  hasGeneratedBefore: boolean
}

const CONNECTORS = ['な', 'のような', 'っぽい', 'すぎる', '風の', 'なし']

export default function GenerateForm({ onGenerate, onSubmit, isGenerating, hasGeneratedBefore }: Props) {
  const [modifier, setModifier] = useState('')
  const [connector, setConnector] = useState('な')
  const [object, setObject] = useState('')
  const [note, setNote] = useState('')

  const canGenerate = modifier.trim() !== '' && object.trim() !== '' && !isGenerating

  const generate = () => {
    if (!canGenerate) return
    onGenerate({
      modifier: modifier.trim(),
      connector,
      object: object.trim(),
      note: note.trim() || undefined,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 3つの入力フィールド */}
      <div className="flex items-center gap-x-4">
        <input
          type="text"
          value={modifier}
          onChange={(e) => setModifier(e.target.value)}
          placeholder="あつあつ"
          className="flex-[3] min-w-0 px-4 py-2.5 bg-zinc-100 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none transition"
        />
        <div className="relative min-w-[100px] flex-[1]">
          <select
            value={connector}
            onChange={(e) => setConnector(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2.5 bg-zinc-100 rounded-lg text-sm text-zinc-700 focus:outline-none cursor-pointer"
          >
            {CONNECTORS.map((c) => (
              <option key={c} value={c}>{c === 'なし' ? '—' : c}</option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 text-zinc-400"
            viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L6 7L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <input
          type="text"
          value={object}
          onChange={(e) => setObject(e.target.value)}
          placeholder="やかん"
          className="flex-[3] min-w-0 px-4 py-2.5 bg-zinc-100 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none transition"
        />
      </div>

      {/* State 2: 入力済み・初回未生成 → Create! */}
      {canGenerate && !hasGeneratedBefore && (
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-[#0066cc] hover:bg-[#0052a3] active:scale-[0.98] transition-all"
        >
          Create!
        </button>
      )}

      {/* State 3: 生成済み → テキストエリア + Retry + send! */}
      {hasGeneratedBefore && (
        <div className="space-y-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="スタイル、色味、構図、修正ポイント"
            rows={3}
            className="w-full px-4 py-2.5 bg-zinc-100 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none resize-none"
          />

          <button
            type="submit"
            disabled={!canGenerate}
            className="w-full py-3 rounded-lg font-semibold text-sm bg-white border border-[#0066cc] text-[#0066cc] hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-[#0066cc]/30 border-t-[#0066cc] rounded-full animate-spin" />
                Generating...
              </span>
            ) : 'Retry'}
          </button>

          <div className="pt-20">
            <button
              type="button"
              onClick={() => {
                const keyword = `${modifier.trim()}${connector === 'なし' ? '' : connector}${object.trim()}`
                onSubmit(keyword)
              }}
              disabled={isGenerating}
              className="px-10 py-3 rounded-lg font-semibold text-sm text-white bg-[#0066cc] hover:bg-[#0052a3] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              send!
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
