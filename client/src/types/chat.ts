export interface ChatRoom {
  id: string
  name: string
  description: string | null
  createdById: string | null
  createdAt: string
  updatedAt: string
  streamKey: string
  isLive: boolean
  slug: string
  category: string
  onlineCount: number
  avatarUrl?: string
  messages?: ChatMessage[]
  gifts?: Gift[]
}

export interface ChatMessage {
  id: string
  roomId: string
  userId: string
  content: string
  type: string | null
  createdAt: string
}

export interface Gift {
  id: string
  userId: string
  roomId: string
  type: string
  createdAt: string
  amount: number
}

export interface User {
  id: string
  email: string
  password: string
  name: string
  account: string
  state: string
  createdAt: string
  avatarUrl?: string
  isVerified: boolean
  role: string
  tokenVersion: number
  messages?: ChatMessage[]
  gifts?: Gift[]
  rooms: ChatRoom[]
  tokens?: Token[]
}

export interface Token {
  id: string
  userId: string
  expiresAt: string
  createdAt: string
  token: string
}

export interface ApiResponse<T> {
  status: number
  data: T
  message: string
  code: string
}

export interface SystemInfo {
  memory: number
  cpu: number
  uptime: number
}
