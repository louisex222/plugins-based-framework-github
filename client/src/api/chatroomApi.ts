import service from './service'
import { ChatRoom, ApiResponse } from '../types/chat'
// 建立聊天室的api
export const roomAddApi = async (formData: FormData): Promise<ApiResponse<ChatRoom>> => {
  const response = await service.post('/rooms', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data as ApiResponse<ChatRoom>
}
// 刪除聊天室的api
export const roomDeleteApi = async (id: string): Promise<ApiResponse<null>> => {
  const response = await service.del(`/rooms/${id}`)
  return response.data as ApiResponse<null>
}
// 取得線上聊天室的api
export const roomOnlineApi = async (): Promise<ApiResponse<ChatRoom>> => {
  const response = await service.get('/room/online')
  return response.data as ApiResponse<ChatRoom>
}
// 取得離線聊天室的api
export const roomOfflineApi = async (): Promise<ApiResponse<ChatRoom>> => {
  const response = await service.get('/room/offline')
  return response.data as ApiResponse<ChatRoom>
}
// 根據slug取得聊天室的api
export const roomGetBySlugApi = async (slug: string): Promise<ApiResponse<ChatRoom>> => {
  const response = await service.get(`/rooms/${slug}`)
  return response.data as ApiResponse<ChatRoom>
}
// 取得所有聊天室的api
export const roomAllApi = async (): Promise<ApiResponse<ChatRoom[]>> => {
  const response = await service.get('/rooms')
  return response.data as ApiResponse<ChatRoom[]>
}
