import React, { useEffect, useState, useCallback } from 'react'
import { Clock, LogIn } from 'lucide-react'
import { Socket } from 'socket.io-client'
import { useTranslation } from 'react-i18next'

interface DeviceType {
  id: number
  active: string
  device: string
  time: string
  icon: React.FC
  color: string
}

interface DeviceData {
  mobileModel: string
  browserName: string
  time: string
}

export const RecentActivityModule: React.FC<{ socket: Socket }> = ({ socket }) => {
  const [newsData, setNewData] = useState<DeviceType[]>([])
  const { t } = useTranslation()

  const fcHandleDeviceData = useCallback(
    (data: DeviceData) => {
      setNewData(prev => [
        ...prev,
        {
          id: prev.length + 1,
          active: t('login from device'),
          device: data.mobileModel + data.browserName,
          time: data.time,
          icon: LogIn,
          color: 'bg-green-500 text-green-600',
        },
      ])
    },
    [t],
  )

  useEffect(() => {
    socket.on('deviceType', fcHandleDeviceData)
    return () => {
      socket.off('deviceType', fcHandleDeviceData)
    }
  }, [fcHandleDeviceData, socket])

  return (
    <div className="p-4 border rounded shadow bg-white dark:bg-slate-950 h-[200px] overflow-y-auto">
      <h2 className="font-bold mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        {t('platform instant messages')}
      </h2>
      <div className="space-y-4">
        {newsData.length === 0 ? (
          <p className="text-gray-500">{t('no messages at the moment')}</p>
        ) : (
          newsData.map(activity => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-full shrink-0 ${activity.color}`}>
                <activity.icon />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {activity.active}{' '}
                  <span className="text-gray-500 font-normal">"{activity.device}"</span>
                </p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
