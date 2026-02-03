/**
 * 環境配置檔案
 * 統一管理 API 和 Socket 連線 URL
 */
const getUrlWithProtocol = (url: string | undefined, defaultUrl: string) => {
  if (!url) return defaultUrl.replace(/\/$/, '')
  const formattedUrl = url.startsWith('http') ? url : `https://${url}`
  return formattedUrl.replace(/\/$/, '') // 移除末尾斜線
}

// 判斷是否為生產環境
const isProd = import.meta.env.PROD

// 後端 API 基礎 URL
export const API_BASE_URL = isProd
  ? import.meta.env.VITE_API_URL || '/api' // 生產環境:使用環境變數或預設值
  : 'https://plugins-based-framework-backend-lzav.onrender.com/api' // 開發環境:使用 Vite proxy

// Socket.IO 伺服器 URL
export const SOCKET_URL = isProd
  ? import.meta.env.VITE_SOCKET_URL || window.location.origin
  : 'https://plugins-based-framework-backend-lzav.onrender.com'

// 串流伺服器 URL (MediaMTX) - 預設指向 localhost:8889 (WebRTC)
// 生產環境需設定 VITE_STREAM_URL 為 Railway 的公開網址
export const STREAM_URL = isProd
  ? 'https://mediamtx-louise-2026.fly.dev'
  : 'https://mediamtx-louise-2026.fly.dev'

// 其他環境配置
export const ENV_CONFIG = {
  isProd,
  apiBaseUrl: API_BASE_URL,
  socketUrl: SOCKET_URL,
  streamUrl: STREAM_URL,
} as const

export default ENV_CONFIG
