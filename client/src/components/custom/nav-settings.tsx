'use client'

import * as React from 'react'
import { type LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/custom/theme-provider'
import { ChevronsUpDown, Moon, Sun, ChevronRight, Languages } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useTranslation } from 'react-i18next'

export const NavSecondary: React.FC<{
  nav: { title: string; url: string; icon: LucideIcon }[]
}> = ({
  nav,
  ...props
}: {
  nav: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) => {
  const { setTheme } = useTheme()
  const { i18n, t } = useTranslation()
  const [lang, setLang] = React.useState(i18n.language || 'en-US')

  /**
   * fcChangeLang 改變語言
   * @param {string} lang - 語言
   * @returns {void}
   */
  const fcChangeLang = (lang: string) => {
    setLang(lang)
    i18n.changeLanguage(lang)
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {nav.map(item =>
            item.title === t('settings') ? (
              <Collapsible key={item.title} asChild defaultOpen={false}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={t(item.title)}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/menu-item:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuSubButton>
                              <div>{t('theme')}</div>
                              <ChevronsUpDown className="ml-auto size-4" />
                              <span className="sr-only">Toggle</span>
                            </SidebarMenuSubButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent sideOffset={4} side="right">
                            <DropdownMenuItem onClick={() => setTheme('light')}>
                              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                              {t('light')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('dark')}>
                              <Moon className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                              {t('dark')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuSubButton>
                              <div>{t('language')}</div>
                              <ChevronsUpDown className="ml-auto size-4" />
                              <span className="sr-only">Toggle</span>
                            </SidebarMenuSubButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent sideOffset={4} side="right">
                            <DropdownMenuItem onClick={() => fcChangeLang('zh-TW')}>
                              <Languages color={lang === 'zh-TW' ? 'hsl(var(--primary))' : ''} />
                              <span>{t('zh-tw')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fcChangeLang('en-US')}>
                              <Languages color={lang === 'en-US' ? 'hsl(var(--primary))' : ''} />
                              <span>{t('en-us')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fcChangeLang('ko-KR')}>
                              <Languages color={lang === 'ko-KR' ? 'hsl(var(--primary))' : ''} />
                              <span>{t('ko-kr')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{t(item.title)}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
