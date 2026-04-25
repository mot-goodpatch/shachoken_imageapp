'use client'

import { GenerateResponse } from '@/types'

interface Props {
  result: GenerateResponse | null
  isGenerating: boolean
}

export default function ImageResult({ result, isGenerating }: Props) {
  return (
    <div className="w-full">
      {isGenerating ? (
        /* 生成中：枠なし、スピナーのみ */
        <div className="w-full aspect-square flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-700 rounded-full animate-spin" />
        </div>
      ) : result ? (
        /* 画像表示 */
        <div className="aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.imageUrl}
            alt="Generated"
            className="w-full h-full object-cover rounded-2xl block"
          />
        </div>
      ) : (
        /* 初期状態：プレースホルダー */
        <div className="w-full aspect-square rounded-2xl bg-zinc-50" />
      )}

      {!isGenerating && result?.prompt && (
        <p className="mt-2 px-1 text-[10px] text-zinc-300 font-mono leading-relaxed break-all">
          {result.prompt}
        </p>
      )}
    </div>
  )
}
