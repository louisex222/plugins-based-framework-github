import { createBrowserRouter } from 'react-router'
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

const basename = import.meta.env.BASE_URL
const router = createBrowserRouter(
  [
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
  ],
  {
    // 移除尾部斜線，除非它是根路徑 '/'
    basename: basename?.endsWith('/') && basename !== '/' ? basename.slice(0, -1) : basename,
  },
)

export default router
