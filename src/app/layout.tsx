import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Goodpatch人材を例えるなら？',
  description: '言葉の組み合わせから画像を生成する社内遊びツール',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
