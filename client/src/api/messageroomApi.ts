import { ChatMessage } from '../types/chat'
import service from './service'

// 建立新增訊息的api跟資料庫 (C)
export const createMessage = async (
  slug: string,
  userId: string,
  content: string,
  type?: string,
): Promise<ChatMessage> => {
  const response = await service.post(`/rooms/${slug}/messages`, {
    userId,
    content,
    type,
  })
  return response.data as ChatMessage
}
// 取得所選房間在資料庫裏的訊息 (R)
export const getMessages = async (roomId: string, limit?: number): Promise<ChatMessage[]> => {
  const response = await service.get(`/rooms/${roomId}/messages`, {
    params: { limit },
  })
  return response.data as ChatMessage[]
}
