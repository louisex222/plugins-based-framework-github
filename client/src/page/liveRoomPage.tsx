import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { LiveRoomModule } from '@/module/live-room-module'
import io from 'socket.io-client'
import dayjs from 'dayjs'
import { roomGetBySlugApi } from '@/api/chatroomApi'
import { ChatRoom } from '../types/chat'
import { useTranslation } from 'react-i18next'
import { SOCKET_URL } from '@/config/env'
// https://day.js.org/docs/zh-CN/parse/now

const socket = io(SOCKET_URL)

interface CssData {
  width?: string
  position: React.CSSProperties['position']
  height?: string
}
export const LiveRoomPage: React.FC = () => {
  const { streamkey } = useParams()
  const { open } = useOutletContext<{ open: boolean }>()
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const { t } = useTranslation()
  const userData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userdata') || '{}')
    } catch {
      return {}
    }
  }, [])
  const [messageData, setMessageData] = useState({
    message: '',
    user: userData.name || '',
    room: streamkey,
    date: '',
  })
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<
    { message: string; user: string; room: string; date: string }[]
  >([])
  const isFirstRender = useRef(true)
  const isFirstSocketRender = useRef(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [innerWidth, setInnerWidth] = useState(window.innerWidth)

  const cssData = useMemo<CssData>(() => {
    if (innerWidth < 768) {
      return {
        width: '100%',
        position: 'static',
      }
    }
    return {
      position: 'fixed',
    }
  }, [innerWidth])
  /**
   * fcChange 處理輸入框變更
   * @param {React.ChangeEvent<HTMLInputElement>} e - 輸入框事件
   * @returns {void}
   */
  const fcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageData({ ...messageData, message: e.target.value })
  }
  /**
   * fcEnterMessage 處理留言輸入框事件
   * @param {React.KeyboardEvent<HTMLInputElement>} e - 輸入框事件
   * @returns {void}
   */
  const fcEnterMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (messageData.message === '') return
      const dataToSend = {
        ...messageData,
        date: new Date().toLocaleTimeString(),
      }
      socket.emit('sendMessage', dataToSend)
      setMessageData({ ...messageData, message: '', date: '' })
    }
  }
  const fcGetRoomBySlug = useCallback(async () => {
    try {
      if (streamkey) {
        const res = await roomGetBySlugApi(streamkey)
        console.log(res);
        if (res.status === 200) {
          setCurrentRoom(res.data)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }, [streamkey]) // 加入 streamkey 作為依賴
  useEffect(() => {
    const resizeHandler = () => {
      setInnerWidth(window.innerWidth)
    }
    window.addEventListener('resize', resizeHandler)
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const loadRoom = async () => {
      await fcGetRoomBySlug()
    }
    loadRoom()
  }, [fcGetRoomBySlug])

  useEffect(() => {
    if (isFirstSocketRender.current) {
      isFirstSocketRender.current = false
      return
    }

    if (streamkey && userData.name) {
      // 進入頁面時發送加入房間事件
      socket.emit('joinRoom', { slug: streamkey, userName: userData.name })
    }

    const fcHandleMessage = (data: {
      message: string
      user: string
      room: string
      date: string
    }) => {
      setMessages(prev => [...prev, data])
    }

    const fcHandleUserJoined = (data: { message: string; time?: string }) => {
      setMessages(prev => [
        ...prev,
        {
          user: t('system'),
          message: data.message,
          date: data.time || dayjs().format('HH:mm:ss'),
          room: streamkey || '',
        },
      ])
    }

    const fcHandleUserLeave = (data: { message: string; time?: string }) => {
      setMessages(prev => [
        ...prev,
        {
          user: t('system'),
          message: data.message,
          date: data.time || dayjs().format('HH:mm:ss'),
          room: streamkey || '',
        },
      ])
    }

    // 監聽消息
    socket.on('receiveMessage', fcHandleMessage)
    socket.on('userJoined', fcHandleUserJoined)
    socket.on('userLeave', fcHandleUserLeave)

    return () => {
      socket.off('receiveMessage', fcHandleMessage)
      socket.off('userJoined', fcHandleUserJoined)
      socket.off('userLeave', fcHandleUserLeave)
      socket.emit('leaveRoom', { slug: streamkey, userName: userData.name })
    }
  }, [streamkey, userData.name, userData.account, t]) // 加入缺失的依賴

  useEffect(() => {
    const lastChild = scrollRef.current?.lastElementChild
    lastChild?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className={cn('flex', innerWidth < 768 ? 'flex-col' : 'flex-row')}>
      <div
        style={{
          width: cssData?.width,
        }}
        className={cn(
          'transition-all duration-300 ease-in-out',
          !rightSidebarOpen ? 'w-full' : open ? 'w-[calc(80%-24px)]' : 'w-[calc(82%-12px)]',
        )}
      >
        {/* 內嵌的容器 - 包含左右 sidebar */}
        <div className="border rounded-lg  bg-background">
          <div className="flex relative items-center">
            {/* 中間主內容區域 */}
            <div className="flex-1 flex flex-col w-80 relative">
              <div className="flex items-center gap-2 absolute  right-2 z-10">
                {!rightSidebarOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRightSidebarOpen(true)}
                    className="h-10 w-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
              </div>
              {streamkey ? (
                <LiveRoomModule
                  slug={streamkey}
                  streamNumber={currentRoom?.streamKey}
                  username={userData?.name}
                />
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 右側 Sidebar - 固定在螢幕右側 */}
      <div
        className={cn(
          'fixed right-0 border-l bg-sidebar transition-all duration-300 ease-in-out z-40',
          rightSidebarOpen ? 'w-[18%]' : 'w-0',
        )}
        style={{
          top: 'calc(var(--header-height, 3rem) - 7px)',
          height: 'calc(100vh - var(--header-height, 3rem) + 7px)',
          width: cssData?.width,
          position: cssData?.position,
        }}
      >
        <div className={cn('h-full overflow-hidden flex flex-col', !rightSidebarOpen && 'hidden')}>
          <div className="p-2 border-b flex items-center justify-between shrink-0">
            <h3 className="text-lg font-semibold">{t('live chat room')}</h3>
            {innerWidth < 768 ? (
              ''
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightSidebarOpen(false)}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="p-2 flex-1 overflow-y-auto mb-14" ref={scrollRef}>
            {messages.map((item, id) => (
              <div key={id} className="w-full flex items-center gap-2 px-1 py-1 rounded-md text-sm">
                <span className="font-bold">{item.user}:</span>
                <span>{item.message}</span>
                <span className="text-xs text-muted-foreground ml-auto">{item.date}</span>
              </div>
            ))}
          </div>
          <Input
            onKeyDown={fcEnterMessage}
            value={messageData.message}
            onChange={fcChange}
            className="relative bottom-2 left-2 p-2 border rounded-md  w-[calc(100%-70px)]"
            type="text"
            placeholder={t('send message')}
          />
        </div>
      </div>
    </div>
  )
}
