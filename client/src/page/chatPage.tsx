import React, { useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useNavigate } from 'react-router-dom'
import { roomDeleteApi, roomAllApi } from '@/api/chatroomApi'
import { RoomAddDialog } from '@/components/custom/room-add-dialog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import io from 'socket.io-client'
import { LivePreviewModule } from '@/module/live-preview-module'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { SOCKET_URL } from '@/config/env'

const socket = io(SOCKET_URL)

interface Room {
  id: string
  name: string
  description: string
  createdById: string
  createdAt: string
  updatedAt: string
  streamKey: string
  isLive: boolean
  slug: string
  endedAt: string
  onlineCount: number
  avatarUrl?: string
}
export const ChatPage: React.FC = () => {
  const navigate = useNavigate()
  const [hoveredRoomId, setHoveredRoomId] = React.useState<string | null>(null)
  const [liveroom, setLiveroom] = React.useState<Room[]>([])
  const [offlineRoom, setOfflineRoom] = React.useState<Room[]>([])
  const userdata = JSON.parse(localStorage.getItem('userdata') || '{}')
  const { t } = useTranslation()
  //取得直播聊天室
  const fcGetLiveRoom = useCallback((data: Room[]) => {
    setLiveroom(data)
  }, [])
  //取得離線聊天室
  const fcGetOfflineRoom = useCallback((data: Room[]) => {
    setOfflineRoom(data)
  }, [])

  /**
   * fcDeleteRoom 處理刪除聊天室
   * @param {string} id - 聊天室ID
   * @returns {void}
   */
  const fcDeleteRoom = useCallback(
    async (id: string) => {
      try {
        const res = await roomDeleteApi(id)
        if (res.status === 200) {
          toast.success(t(res.code))
          socket.emit('offRoom')
        } else {
          toast.error(t(res.code))
        }
      } catch (error) {
        console.error(error)
      }
    },
    [t],
  )
  /**
   * fcEnterRoom 處理進入聊天室
   * @param {Room} room - 聊天室
   * @returns {void}
   */
  const fcEnterRoom = useCallback(
    async (room: Room) => {
      if (!room.isLive && room.slug !== userdata.account) {
        toast.info(t('this chat room is not live.'))
        return
      }
      navigate(`/liveRoomPage/${room.slug}`)
    },
    [navigate, t, userdata.account],
  )

  useEffect(() => {
    roomAllApi()
    socket.emit('activeRoom')
    socket.emit('offRoom')
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '[' && hoveredRoomId) {
        e.preventDefault()
        fcDeleteRoom(hoveredRoomId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    socket.on('onlineRooms', fcGetLiveRoom)
    socket.on('offlineRooms', fcGetOfflineRoom)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      socket.off('onlineRooms', fcGetLiveRoom)
      socket.off('offlineRooms', fcGetOfflineRoom)
    }
  }, [hoveredRoomId, fcDeleteRoom, fcGetLiveRoom, fcGetOfflineRoom])

  return (
    <div className="space-y-4 relative">
      {/* Header */}
      <div className="flex items-center justify-end absolute top-0 right-0">
        <RoomAddDialog socket={socket} />
      </div>
      {/* Rooms */}
      <h2 className="text-xl font-semibold">{t('the chat room is currently live.')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Live Rooms */}
        {liveroom.map(room => (
          <Card
            key={room.id}
            className="hover:shadow-md transition cursor-pointer"
            onClick={() => {
              fcEnterRoom(room)
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <Badge variant={room.isLive ? 'destructive' : 'secondary'}>
                {room.isLive ? t('online') : t('offline')}
              </Badge>
              <CardTitle className="text-sm text-muted-foreground">
                {t('number of people in the room')}：{room.onlineCount}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex items-center justify-center">
              {room.isLive ? (
                <LivePreviewModule slug={room.slug} streamKey={room.streamKey} />
              ) : (
                <div className="w-full aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  <img src={room?.avatarUrl} alt="" className="w-20 h-20 opacity-20 grayscale" />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between">
                <Avatar className="mr-3">
                  <AvatarImage src={room?.avatarUrl} />
                  <AvatarFallback>CD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span>{room.description}</span>
                  <CardDescription>{room.name}</CardDescription>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
        {/* Offline Rooms */}
      </div>
      <h2 className="text-xl font-semibold">{t('off chat rooms')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {offlineRoom.map(room => (
          <ContextMenu key={room.id}>
            <ContextMenuTrigger className="">
              <Card
                className="hover:shadow-md transition cursor-pointer"
                onMouseEnter={() => setHoveredRoomId(room.id)}
                onMouseLeave={() => setHoveredRoomId(null)}
                onClick={() => {
                  fcEnterRoom(room)
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <Badge variant={room.isLive ? 'destructive' : 'secondary'}>
                    {room.isLive ? t('online') : t('offline')}
                  </Badge>
                  <CardTitle className="text-sm text-muted-foreground">
                    {t('number of people in the room')}：
                    {room.onlineCount < 0 ? '0' : room.onlineCount}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex items-center justify-center">
                  <div className="w-full aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    <img src={room.avatarUrl} alt="" className="w-20 h-20 opacity-20 grayscale" />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between">
                    <Avatar className="mr-3">
                      <AvatarImage src={room.avatarUrl} />
                      <AvatarFallback>CD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{room.description}</span>
                      <CardDescription>{room.name}</CardDescription>
                      <div className="mt-2 text-xs text-muted-foreground bg-secondary/50 p-1 rounded font-mono">
                        Key: {room.streamKey || t('not set')}
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52">
              <ContextMenuItem className="cursor-pointer" onClick={() => fcDeleteRoom(room.id)}>
                {t('delete user')}
                <ContextMenuShortcut>⌘[</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </div>
  )
}
