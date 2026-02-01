import { Outlet } from 'react-router'
import { MainSidebar } from '@/components/main-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainHeader } from '@/components/main-header'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { userUpdateStateApi } from '@/api/userApi'

export const MainPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(true)
  const isVisible = useRef(false)
  const userdata = localStorage.getItem('userdata')

  if (userdata === null) {
    localStorage.setItem('userdata', JSON.stringify({}))
  }

  /**
   * @description 頁籤切換變更上線離線狀態
   * @returns {void}
   */
  useEffect(() => {
    if (isVisible.current) {
      return
    }

    const visibilityHandler = () => {
      const parsedUserdata = JSON.parse(userdata || '{}')
      if (!parsedUserdata.id) return

      if (document.visibilityState === 'hidden') {
        userUpdateStateApi(parsedUserdata.id, 'offline')
      } else {
        userUpdateStateApi(parsedUserdata.id, 'online')
      }
    }

    document.addEventListener('visibilitychange', visibilityHandler)
    isVisible.current = true

    return () => {
      document.removeEventListener('visibilitychange', visibilityHandler)
    }
  }, [userdata]) // 加入 userdata 作為依賴

  useEffect(() => {
    if (userdata === '{}' || userdata === null) {
      navigate('/login')
    }
  }, [location, navigate, userdata]) // 加入 navigate 與 userdata 作為依賴

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
      onOpenChange={() => setOpen(!open)}
      open={open}
    >
      <MainSidebar variant="inset" />
      <SidebarInset>
        <MainHeader open={open} />
        <main className="p-3 mt-[28px]">
          <Outlet context={{ open }} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
