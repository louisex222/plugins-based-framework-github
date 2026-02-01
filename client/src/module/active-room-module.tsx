import React, { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { useTranslation } from 'react-i18next'

interface Room {
  id: string
  name: string
  description: string
  onlineCount: number
  slug: string
}

export const ActiveRoomModule: React.FC<{ socket: Socket }> = ({ socket }) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const { t } = useTranslation()
  /**
   * fcGetRoomData 處理直播房間資料
   * @param {Room[]} data - 直播房間資料
   * @returns {void}
   */
  const fcGetRoomData = async (data: Room[]) => {
    setRooms(data)
  }

  useEffect(() => {
    const onConnect = () => {
      socket.emit('activeRoom')
    }
    if (socket.connected) {
      onConnect()
    }
    socket.on('connect', onConnect)
    socket.on('roomData', fcGetRoomData)
    return () => {
      socket.off('connect', onConnect)
      socket.off('roomData', fcGetRoomData)
    }
  }, [socket])

  return (
    <div className="p-4 border rounded shadow h-[200px] overflow-y-auto">
      <h2 className="font-bold mb-2">{t('live streaming')}</h2>
      {rooms.length === 0 ? (
        <p className="text-gray-500">{t('no rooms live streaming')}</p>
      ) : (
        <ul className="space-y-1">
          {rooms.map(room => (
            <li key={room.id} className="flex justify-between p-2 rounded bg-secondary">
              <div className="flex flex-col">
                <span className="font-medium">{room.name || room.slug}</span>
                {room.description && (
                  <span className="text-xs text-gray-400">{room.description}</span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-green-500 text-xs">● {t('live')}</span>
                <span className="text-sm">
                  {room.onlineCount} {t('people online')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
