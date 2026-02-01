import { Link, useLocation } from 'react-router-dom'
import { type LucideIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useTranslation } from 'react-i18next'

export const NavMain: React.FC<{
  nav: { title: string; url: string; icon?: LucideIcon }[]
}> = ({
  nav,
}: {
  nav: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) => {
  const location = useLocation()
  const { t } = useTranslation()
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {nav.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={t(item.title)}
                isActive={`${item.url}` === location.pathname}
              >
                <Link to={`${item.url}`}>
                  {item.icon && <item.icon />}
                  <span>{t(item.title)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
