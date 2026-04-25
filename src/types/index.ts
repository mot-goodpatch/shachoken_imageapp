export interface GenerateRequest {
  modifier: string
  connector: string
  object: string
  style?: string
  note?: string
}

export interface GenerateResponse {
  imageUrl: string
  prompt: string
  seed: number
}

export interface SubmitRequest {
  name: string
  imageUrl: string
  rating?: number | null
  comment?: string
  prompt: string
  keyword: string
  pageTitle?: string
  roomId?: string
}

export interface Submission {
  id: string
  name: string
  keyword: string
  prompt: string
  imageUrl: string
  rating: number | null
  comment: string | null
  pageTitle?: string
  roomId?: string
  createdAt: string
}

export interface Room {
  id: string
  adminToken: string
  title: string
  createdAt: string
}
