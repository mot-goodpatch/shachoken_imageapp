'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import GenerateForm from '@/components/GenerateForm'
import ImageResult from '@/components/ImageResult'
import SubmitModal from '@/components/SubmitModal'
import { GenerateRequest, GenerateResponse } from '@/types'
import { translateJaToEn } from '@/lib/translator'

const SAMPLE_RESULT: GenerateResponse = {
  imageUrl: '/sample.jpg',
  prompt: '',
  seed: 0,
}

interface Props {
  titleJa: string
  roomId?: string
}

export default function HomeClient({ titleJa, roomId }: Props) {
  const [result, setResult] = useState<GenerateResponse>(SAMPLE_RESULT)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGeneratedBefore, setHasGeneratedBefore] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [submitKeyword, setSubmitKeyword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [titleEn, setTitleEn] = useState('')

  useEffect(() => {
    translateJaToEn(titleJa).then(setTitleEn)
  }, [titleJa])

  const galleryHref = roomId
    ? `/gallery?room=${roomId}`
    : `/gallery?title=${encodeURIComponent(titleJa)}`

  const handleGenerate = useCallback(async (request: GenerateRequest) => {
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '画像生成に失敗しました')
      setResult(data)
      setHasGeneratedBefore(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleOpenSubmit = useCallback((keyword: string) => {
    setSubmitKeyword(keyword)
    setShowModal(true)
  }, [])

  const handleSubmitSuccess = useCallback(() => {
    setHasSubmitted(true)
    localStorage.setItem('shachoken_submitted', 'true')
  }, [])

  return (
    <main className="min-h-screen bg-white flex flex-col">

      <div className="flex-1 flex items-center">
        <div className="max-w-[1400px] w-full mx-auto px-8 md:px-12">
          <div className="flex flex-col md:flex-row md:gap-x-16 md:items-center">

            {/* 左カラム（45%） */}
            <div className="md:w-[45%] flex-shrink-0 overflow-hidden px-6 md:px-0">
              <header className="mb-20 pr-8">
                <h1 className="text-3xl font-medium tracking-wider text-zinc-900 mb-2">
                  {titleJa}
                </h1>
                <p className="text-sm text-[#0066cc] tracking-wide">
                  {titleEn}
                </p>
              </header>

              <GenerateForm
                onGenerate={handleGenerate}
                onSubmit={handleOpenSubmit}
                isGenerating={isGenerating}
                hasGeneratedBefore={hasGeneratedBefore}
              />

              {error && (
                <div className="mt-5 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-500">
                  {error}
                </div>
              )}
            </div>

            {/* 右カラム（55%） */}
            <div className="flex-1 flex-grow min-w-0 mt-10 md:mt-0 flex justify-center items-center px-12">
              <ImageResult
                result={isGenerating ? null : result}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        </div>
      </div>

      {hasSubmitted && (
        <div className="fixed bottom-6 left-0 right-0 pointer-events-none">
          <div className="max-w-[1400px] mx-auto px-8 md:px-12">
            <Link
              href={galleryHref}
              className="pointer-events-auto text-xs text-zinc-300 hover:text-zinc-500 transition-colors"
            >
              送信済みの画像を見る →
            </Link>
          </div>
        </div>
      )}

      {showModal && (
        <SubmitModal
          imageUrl={result.imageUrl}
          prompt={result.prompt}
          keyword={submitKeyword}
          pageTitle={titleJa}
          roomId={roomId}
          onClose={() => setShowModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </main>
  )
}
