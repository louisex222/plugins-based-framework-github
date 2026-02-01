import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLocation } from 'react-router-dom'
import { ModeToggle } from '@/components/custom/mode-toggle'
import { useTranslation } from 'react-i18next'
import { useEffect, useState, useCallback } from 'react'
import { userOnlineCountApi } from '@/api/userApi'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const MainHeader: React.FC<{ open: boolean }> = ({ open }) => {
  const location = useLocation()
  const { t } = useTranslation()
  const [onlineCount, setOnlineCount] = useState<number>(0)
  const [width, setWidth] = useState(window.innerWidth)
  //導航欄對應標題
  const navMapping = [
    {
      title: t('dashboard'),
      url: '/',
    },
    {
      title: t('usersettings'),
      url: '/settingsPage',
    },
    {
      title: t('chatroom'),
      url: '/chatPage',
    },
  ]
  /**
   * fcFetchOnlineCount 取得線上使用者數量
   * @returns {void}
   */
  const fcFetchOnlineCount = useCallback(async () => {
    try {
      const res = await userOnlineCountApi()
      if (res.status === 200) {
        setOnlineCount(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch online count', error)
    }
  }, [])

  useEffect(() => {
    const resizeHandler = () => {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', resizeHandler)

    // 取得線上使用者數量：封裝在異步環境中避免級聯渲染
    const initData = async () => {
      await fcFetchOnlineCount()
    }
    initData()

    // 60秒更新一次
    const interval = setInterval(fcFetchOnlineCount, 60000)
    return () => {
      window.removeEventListener('resize', resizeHandler)
      clearInterval(interval)
    }
  }, [fcFetchOnlineCount])

  return (
    <div
      className={cn(
        'fixed top-0 right-0 bg-background rounded-t-lg z-50 transition-all duration-300 ease-in-out',
        open && width > 768
          ? 'w-[calc(100%-var(--sidebar-width))]'
          : !open && width > 768
            ? 'w-[calc(100%-72px)]'
            : 'w-[100%]',
      )}
    >
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <h1 className="text-base font-medium">
            {navMapping.find(nav => nav.url === location.pathname)?.title}
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{onlineCount}</span>
              <Badge
                variant="outline"
                className="text-[10px] px-1 py-0 h-4 bg-green-500/10 text-green-600 border-green-200 dark:text-green-400 dark:border-green-900"
              >
                {t('online')}
              </Badge>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>
    </div>
  )
}
