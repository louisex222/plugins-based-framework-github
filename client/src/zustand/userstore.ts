import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { io } from 'socket.io-client'
import { getSelectorsByUserAgent } from 'react-device-detect'
import { SOCKET_URL } from '@/config/env'

const socket = io(SOCKET_URL)
interface UserStore {
  isLogin: boolean
  login: () => void
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    set => ({
      isLogin: false,
      login: () => {
        set({ isLogin: true })
        socket.emit('deviceData', getSelectorsByUserAgent(navigator.userAgent))
      },
      logout: () => {
        set({ isLogin: false })
        localStorage.setItem('userdata', JSON.stringify({}))
      },
    }),
    {
      name: 'userStore',
    },
  ),
)
