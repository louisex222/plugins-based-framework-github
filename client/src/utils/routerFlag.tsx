interface RouterFlagProps {
  routerFlag: boolean
  haveFlagList: string[]
  filterList: string[]
}

const desktopRouterList = [
  'dashboardPage',
  'chatPage',
  'settingsPage',
  'liveRoomPage',
  'profilePage',
]

class GlobalRouterSetting implements RouterFlagProps {
  routerFlag: boolean
  haveFlagList: string[]
  filterList: string[]
  constructor() {
    this.routerFlag = false
    this.haveFlagList = ['']
    this.filterList = ['']
  }
  fcSetFilterRouter() {
    const targetTouterList = desktopRouterList.filter(item => {
      return !this.haveFlagList.includes(item) && !this.routerFlag
    })
    this.filterList = targetTouterList
  }
  fcGetFilterRouter() {
    this.fcSetFilterRouter()
    return this.filterList
  }
}

export default GlobalRouterSetting
