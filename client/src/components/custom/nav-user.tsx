'use client'
import { Bell, ChevronsUpDown, LogOut, LogIn } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

import { Link } from 'react-router-dom'
import { useUserStore } from '@/zustand/userstore'
import { useNavigate } from 'react-router-dom'
import girlImage from '@/assets/images/girl.jpeg'
import { userLogoutApi } from '@/api/userApi'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { isMobile } from 'react-device-detect'
export const NavUser: React.FC = () => {
  const navigate = useNavigate()
  const { isLogin, logout } = useUserStore()
  const userData = JSON.parse(localStorage.getItem('userdata') || '{}')

  const { t } = useTranslation()
  /**
   * fcLogOut 登出
   * @returns {void}
   */
  const fcLogOut = async () => {
    try {
      const res = await userLogoutApi(userData.id)

      if (res.status === 200) {
        toast.success(t(res.code))
        logout()
        navigate('/login')
      } else {
        toast.error(t(res.code))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <SidebarMenu>
      {!isLogin && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/login">
              <LogIn />
              <span>{t('login')}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      {isLogin && (
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div
                  className="w-2 h-2 bg-primary rounded-full data-[state=online]:bg-green-500 data-[state=offline]:bg-red-500"
                  data-state={userData.state}
                ></div>
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={userData.avatarUrl ? userData.avatarUrl : girlImage}
                    alt={userData.name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{t(userData.name)}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {t(userData.state)}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={userData.avatarUrl ? userData.avatarUrl : girlImage}
                      alt={userData.name}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{t(userData.name)}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {t(userData.state)}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profilePage')}>
                <Bell />
                {t('edit personal profile')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={fcLogOut}>
                <LogOut />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  )
}
