import React, { useEffect, useState, useCallback } from 'react'
import { Server, Wifi, HardDrive } from 'lucide-react'
import { systemInfoApi } from '../api/serverApi'
import { useTranslation } from 'react-i18next'
import { API_BASE_URL } from '@/config/env'

export const SystemStatusModule: React.FC = () => {
  const [latency, setLatency] = useState<number | null>(null)
  const [status, setStatus] = useState<'online' | 'offline' | 'degraded'>('online')
  const [memory, setMemory] = useState<number | null>(null)
  const { t } = useTranslation()

  /**
   * fcCheckLatency 處理網路延遲
   * @returns {void}
   */
  const fcCheckLatency = useCallback(async () => {
    const start = performance.now()
    try {
      let targetUrl = API_BASE_URL
      if (targetUrl.endsWith('/api')) {
        targetUrl = targetUrl.replace('/api', '')
      }
      if (!targetUrl) targetUrl = '/'

      const healthUrl = `${targetUrl}/health`.replace('//health', '/health')

      await fetch(healthUrl, { method: 'GET', cache: 'no-store' })
      const end = performance.now()
      const currentLatency = Math.round(end - start)
      setLatency(currentLatency)
      if (currentLatency < 200) setStatus('online')
      else if (currentLatency < 500) setStatus('degraded')
      else setStatus('degraded') // 高延遲
    } catch (error) {
      console.error('Ping failed', error)
      setLatency(null)
      setStatus('offline')
    }
  }, [])

  /**
   * fcCheckMemory 處理記憶體
   * @returns {void}
   */
  const fcCheckMemory = useCallback(async () => {
    try {
      const info = await systemInfoApi()
      if (info.status === 200) {
        setMemory(info.data.memory)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  /**
   * getStatusColor 獲取狀態顏色
   * @returns {string} 狀態顏色
   */
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-500'
      case 'degraded':
        return 'text-yellow-500'
      case 'offline':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  useEffect(() => {
    // 初始檢測：封裝在異步環境中避免級聯渲染
    const initChecks = async () => {
      await fcCheckLatency()
      await fcCheckMemory()
    }
    initChecks()

    // 每 300 秒檢測一次
    const interval = setInterval(() => {
      fcCheckLatency()
      fcCheckMemory()
    }, 300000)
    return () => clearInterval(interval)
  }, [fcCheckLatency, fcCheckMemory])

  return (
    <div className="p-4 border rounded shadow bg-white dark:bg-slate-950 h-full flex flex-col justify-between">
      <h2 className="font-bold mb-2 flex items-center gap-2">
        <Server className="w-5 h-5" />
        {t('system status')}
      </h2>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-gray-100 dark:bg-slate-800 ${getStatusColor()}`}>
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500">{t('api latency')}</div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {latency !== null ? `${latency} ms` : '---'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <span
              className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}
            ></span>
            <span className="text-sm font-medium capitalize">
              {status === 'online' ? t('good') : status === 'degraded' ? t('slow') : t('offline')}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">{t('continuously listening')}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-gray-100 dark:bg-slate-800 ${getStatusColor()}`}>
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500">{t('memory remaining')}</div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {memory !== null ? `${memory} %` : '--- %'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <span
              className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}
            ></span>
            <span className="text-sm font-medium capitalize">
              {status === 'online' ? t('good') : status === 'degraded' ? t('slow') : t('offline')}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">{t('continuously listening')}</div>
        </div>
      </div>
    </div>
  )
}
