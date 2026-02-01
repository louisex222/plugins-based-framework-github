import axios, { AxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import i18n from '@/i18n'
import { API_BASE_URL } from '@/config/env'
import router from '@/router'

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 9000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
instance.interceptors.request.use(
  config => {
    const userdata = localStorage.getItem('userdata')
    if (userdata) {
      const parsedData = JSON.parse(userdata)
      const token = parsedData.tokens?.[0]?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  error => Promise.reject(error),
)

// Response interceptor
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const serverMessage = error.response.data?.code || 'SYSTEM_ERROR'
      switch (error.response.status) {
        case 400:
          toast.error(i18n.t('request error'))
          break
        case 401:
          // 清除所有相關資料並導向登入頁
          localStorage.removeItem('userdata')
          localStorage.setItem('userStore', JSON.stringify({ state: { isLogin: false } }))
          toast.error(i18n.t(serverMessage))
          setTimeout(() => {
            router.navigate('/login')
          }, 1000)
          break
        case 403:
          toast.error(i18n.t('insufficient permissions'))
          break
        case 404:
          toast.error(i18n.t('resource not found'))
          break
        case 500:
          toast.error(i18n.t('server error'))
          break
        default:
          toast.error(i18n.t('other errors'))
          break
      }
    }
    return Promise.reject(error)
  },
)

const get = <T = unknown>(url: string, config?: AxiosRequestConfig) =>
  instance<T>({
    url,
    method: 'get',
    ...config,
  })
const post = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  instance<T>({
    url,
    method: 'post',
    data,
    ...config,
  })
const put = <T = unknown>(url: string, data: unknown, config?: AxiosRequestConfig) =>
  instance<T>({
    url,
    method: 'put',
    data,
    ...config,
  })
const del = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  instance<T>({
    url,
    method: 'delete',
    data,
    ...config,
  })

export default {
  get,
  post,
  put,
  del,
}
