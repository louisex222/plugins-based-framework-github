import React, { useCallback, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { useTranslation } from 'react-i18next'

interface Notification {
  id: number
  content: string
  user: string
  room: string
}

interface NotificationData {
  message: string
  user: string
  room: string
}

export const NotificationsModule: React.FC<{ socket: Socket }> = ({ socket }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { t } = useTranslation()
  const fcHandleMessage = useCallback((data: NotificationData) => {
    setNotifications(prev => [
      ...prev,
      {
        id: prev.length + 1,
        content: data.message,
        user: data.user,
        room: data.room,
      },
    ])
  }, [])

  useEffect(() => {
    socket.on('notificationMessage', fcHandleMessage)
    return () => {
      socket.off('notificationMessage', fcHandleMessage)
    }
  }, [fcHandleMessage, socket])

  return (
    <div className="p-4 border rounded shadow h-[200px] overflow-y-auto">
      <h2 className="font-bold mb-2">{t('message notifications')}</h2>
      <ul className="space-y-1">
        {notifications.length === 0 ? (
          <p className="text-gray-500">{t('no notifications yet')}</p>
        ) : (
          notifications.map(n => (
            <li key={n.id} className="p-2 rounded bg-secondary">
              {n.user} {t('in')} {n.room} {t('message sent')} {n.content}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
