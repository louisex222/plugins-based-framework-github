import { createHashRouter } from 'react-router'
import { MainPage } from '@/page/mainPage'
import { LoginPage } from '@/page/loginPage'
import GlobalRouterSetting from '@/utils/routerFlag'

const globalRouterSetting = new GlobalRouterSetting()

const routerList = globalRouterSetting.fcGetFilterRouter().map(name => ({
  path:
    name === 'dashboardPage' ? '/' : name === 'liveRoomPage' ? `/${name}/:streamkey` : `/${name}`,
  lazy: async () => {
    const module = await import(`@/page/${name}.tsx`)
    const componentName = name.charAt(0).toUpperCase() + name.slice(1)
    return { Component: module[componentName] }
  },
}))

const router = createHashRouter([
  {
    path: '/',
    Component: MainPage,
    HydrateFallback: () => <div>Loading...</div>,
    children: [...routerList],
  },
  {
    path: '/login',
    Component: LoginPage,
    HydrateFallback: () => <div>Loading...</div>,
  },
])

export default router
