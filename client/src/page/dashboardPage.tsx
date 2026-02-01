import React, { useState } from 'react'
import { ActiveRoomModule } from '@/module/active-room-module'
import { TrendsModule } from '@/module/trends-module'
import { NotificationsModule } from '@/module/notifications-module'
// import {UserStatsModule} from '@/module/user-stats-module';
import { RecentActivityModule } from '@/module/recent-activity-module'
import { SystemStatusModule } from '@/module/system-status-module'
import io from 'socket.io-client'
import { useTranslation } from 'react-i18next'
import { SOCKET_URL } from '@/config/env'

const socket = io(SOCKET_URL)

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const [modules] = useState({
    systemStatusModule: true,
    // userStatsModule: true,
    // feedModule: true,
    activeRoomModule: true,
    trendsModule: true,
    notificationsModule: true,
    recentActivityModule: true,
  })
  /**
   * toggleModule 切換模組
   * @param {string} key - 模組key
   * @returns {void}
   */
  // const toggleModule = (key: string) => {
  //     setModules({ ...modules, [key]: !modules[key as keyof typeof modules] });
  // };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('dashboard')}</h1>
      {/* <div className="flex gap-2 mb-4 flex-wrap">
                {Object.keys(modules).map((key) => (
                <button
                    key={key}
                    className={`px-2 py-1 rounded ${
                    modules[key as keyof typeof modules] ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => toggleModule(key)}
                >
                    {key}
                </button>
                ))}
            </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.systemStatusModule && <SystemStatusModule />}
        {/* {modules.userStatsModule && <UserStatsModule />} */}
        {/* {modules.feedModule && <FeedModule />} */}
        {modules.activeRoomModule && <ActiveRoomModule socket={socket} />}
        {modules.trendsModule && (
          <div className="md:col-span-2">
            <TrendsModule />
          </div>
        )}
        {modules.notificationsModule && <NotificationsModule socket={socket} />}
        {modules.recentActivityModule && <RecentActivityModule socket={socket} />}
      </div>
    </div>
  )
}
