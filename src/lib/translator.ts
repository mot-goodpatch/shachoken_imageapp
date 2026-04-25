const isAlreadyLatin = (text: string) => /^[\x20-\x7E]+$/.test(text)

export async function translateJaToEn(text: string): Promise<string> {
  if (!text.trim() || isAlreadyLatin(text)) return text

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return text

    const data = await res.json()
    const translated = (data[0] as [string, ...unknown[]][])
      .map((item) => item[0])
      .join('')
      .trim()
      .toLowerCase()

    return translated || text
  } catch {
    return text
  }
}
