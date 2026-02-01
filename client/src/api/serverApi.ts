import service from './service'
import { ApiResponse, SystemInfo } from '@/types/chat'

export const systemInfoApi = async (): Promise<ApiResponse<SystemInfo>> => {
  const response = await service.get<ApiResponse<SystemInfo>>('/system-info')
  return response.data as ApiResponse<SystemInfo>
}
