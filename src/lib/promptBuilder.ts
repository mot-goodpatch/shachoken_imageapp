import { translateJaToEn } from './translator'

const WHITE_BG = [
  'pure solid white background',
  'background color #ffffff',
  'studio white backdrop',
  'clean white paper background',
  'no grey tones in background',
  'no background gradients',
  'no background shadows',
  'no colored background',
  'perfectly flat white background',
  'white background only',
].join(', ')

const COMPOSITION = [
  'wider frame composition',
  'ample pure white negative space all around the subject',
  'subject fully contained within the frame',
  'no cropping',
].join(', ')

const BASE_NEGATIVE = [
  'cropped',
  'shadow',
  'drop shadow',
  'cast shadow',
  'cut off shadow',
  'shadow touching border',
  'off-white',
  'grey background',
  'grey tones in background',
  'lighting gradients in background',
  'environmental reflection',
  'edge vignetting',
  'bokeh',
  'blurry',
  'low quality',
  'noise',
].join(', ')

export const STYLE_CONFIG: Record<string, { model: string; description: string; negative: string }> = {
  'リアル': {
    model: 'flux-realism',
    description: 'ultra-realistic photo, sharp details, professional DSLR photography',
    negative: 'cartoon, anime, illustration, painting, drawing, sketch',
  },
  '漫画風': {
    model: 'flux-anime',
    description: 'manga illustration, clean bold line art, anime style, flat cel shading, vibrant colors',
    negative: 'realistic, photograph, 3d render',
  },
  'イラスト': {
    model: 'flux',
    description: 'clean digital illustration, flat vector design, minimalist, professional artwork, bold shapes',
    negative: 'photograph, 3d render, noisy',
  },
  'ピクセルアート': {
    model: 'flux',
    description: 'pixel art, 8-bit retro game sprite, crisp pixels, no anti-aliasing, limited color palette',
    negative: 'smooth, realistic, anti-aliased, photograph',
  },
}

function buildSubjectPhrase(modifier: string, connector: string, obj: string): string {
  switch (connector) {
    case 'な':     return `${modifier} ${obj}`
    case 'のような': return `${obj} that resembles ${modifier}`
    case 'っぽい':  return `${obj} with ${modifier} vibes`
    case 'すぎる':  return `extremely ${modifier} ${obj}`
    case '風の':   return `${obj} inspired by ${modifier}`
    case 'なし':   return obj
    default:       return `${modifier} ${obj}`
  }
}

export async function buildPrompt(
  modifier: string,
  connector: string,
  object: string,
  style: string | undefined,
  note?: string,
): Promise<string> {
  const [translatedModifier, translatedObject, translatedNote] = await Promise.all([
    translateJaToEn(modifier),
    translateJaToEn(object),
    note ? translateJaToEn(note) : Promise.resolve(''),
  ])

  const subject = buildSubjectPhrase(translatedModifier, connector, translatedObject)
  const styleDesc = style ? (STYLE_CONFIG[style]?.description ?? style) : null

  const parts = [
    WHITE_BG,
    COMPOSITION,
    `${subject}, isolated`,
    ...(styleDesc ? [styleDesc] : []),
    ...(translatedNote ? [translatedNote] : []),
  ]

  return parts.join(', ')
}

export function getNegativePrompt(style?: string): string {
  const styleNegative = style ? (STYLE_CONFIG[style]?.negative ?? '') : ''
  return [BASE_NEGATIVE, styleNegative].filter(Boolean).join(', ')
}
