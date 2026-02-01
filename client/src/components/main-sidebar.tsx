'use client'

import * as React from 'react'
import { ChartBar, LayoutDashboard, CircleHelp, GalleryVerticalEnd, Settings2 } from 'lucide-react'
import { NavUser } from '@/components/custom/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavMain } from './custom/nav-main'
import { NavSecondary } from './custom/nav-settings'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function MainSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const userData = JSON.parse(localStorage.getItem('userdata') || '{}')
  const navData = {
    navMain: [
      {
        title: t('dashboard'),
        url: '/',
        icon: LayoutDashboard,
      },

      {
        title: t('chatroom'),
        url: '/chatPage',
        icon: ChartBar,
      },
      {
        title: t('usersettings'),
        url: '/settingsPage',
        icon: Settings2,
      },
    ],
    navSecondary: [
      {
        title: t('settings'),
        url: '#',
        icon: Settings2,
      },
      {
        title: t('gethelp'),
        url: '#',
        icon: CircleHelp,
      },
    ],
  }
  const mixData = {
    ...navData,
    navMain:
      userData.role === 'user'
        ? navData.navMain.filter(item => {
            return item.url !== '/settingsPage'
          })
        : navData.navMain,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <GalleryVerticalEnd className="!size-5" />
                <span className="text-base font-semibold">Kps Inc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain nav={mixData.navMain} />
        <div className="mt-auto" />
        <NavSecondary nav={mixData.navSecondary} />
        <div />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
