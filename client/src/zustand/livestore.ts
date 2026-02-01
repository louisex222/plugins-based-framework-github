import { create } from 'zustand'
import io from 'socket.io-client'
import { SOCKET_URL, STREAM_URL } from '@/config/env'

interface LiveStore {
  isLive: boolean
  stream: MediaStream | null
  viewerStream: MediaStream | null
  error: string | null
  pcRef: RTCPeerConnection | null
  viewerPcRef: RTCPeerConnection | null
  startLive: (slug: string, streamKey?: string, username?: string) => Promise<void>
  stopLive: (slug: string, username?: string) => Promise<void>
  startWatching: (slug: string, streamKey?: string) => Promise<void>
  stopWatching: () => Promise<void>
}

const socket = io(SOCKET_URL)

export const useLiveStore = create<LiveStore>((set, get) => ({
  isLive: false,
  stream: null,
  viewerStream: null,
  error: null,
  pcRef: null,
  viewerPcRef: null,

  startLive: async (slug: string, streamKey?: string, username?: string) => {
    try {
      console.log('正在啟動直播...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })
      set({ pcRef: pc, stream })
      stream.getTracks().forEach(track => pc.addTrack(track, stream))
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      const sendOffer = async () => {
        try {
          const url = streamKey
            ? `${STREAM_URL}/${slug}/whip?key=${streamKey}`
            : `${STREAM_URL}/${slug}/whip`
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/sdp' },
            body: pc.localDescription?.sdp,
          })
          if (!res.ok) throw new Error('MediaMTX 拒絕推流連線')
          const answerSdp = await res.text()
          await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
          set({ isLive: true, error: null })
          socket.emit('liveStart', { slug, username })
        } catch (err) {
          set({ error: err instanceof Error ? err.message : '未知錯誤' })
          get().stopLive(slug, username)
        }
      }
      if (pc.iceGatheringState !== 'complete') {
        const checkState = () => {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState)
            sendOffer()
          }
        }
        pc.addEventListener('icegatheringstatechange', checkState)
        setTimeout(() => {
          if (pc.iceGatheringState !== 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState)
            sendOffer()
          }
        }, 2000)
      } else {
        await sendOffer()
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '未知錯誤' })
      get().stopLive(slug, username)
    }
  },

  stopLive: async (slug: string, username?: string) => {
    const { pcRef, stream } = get()
    if (stream) stream.getTracks().forEach(track => track.stop())
    if (pcRef) {
      pcRef.getSenders().forEach(sender => pcRef.removeTrack(sender))
      pcRef.close()
    }
    socket.emit('liveEnd', { slug, username })
    set({ stream: null, isLive: false, error: null, pcRef: null })
  },

  startWatching: async (slug: string, streamKey?: string) => {
    try {
      console.log(`正在開始觀看直播: ${slug}`)
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })

      set({ viewerPcRef: pc })

      pc.ontrack = event => {
        console.log('收到遠端軌道:', event.streams[0])
        set({ viewerStream: event.streams[0] })
      }

      // WHEP 需要先 addTransceiver 來接收
      pc.addTransceiver('video', { direction: 'recvonly' })
      pc.addTransceiver('audio', { direction: 'recvonly' })

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const sendOffer = async () => {
        try {
          const url = streamKey
            ? `${STREAM_URL}/${slug}/whep?key=${streamKey}`
            : `${STREAM_URL}/${slug}/whep`
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/sdp' },
            body: pc.localDescription?.sdp,
          })

          if (!res.ok) throw new Error('MediaMTX 拒絕播放連線 (可能直播尚未開始)')

          const answerSdp = await res.text()
          await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
          console.log('WHEP 連線成功')
        } catch (err) {
          console.error('WHEP Handshake Error:', err)
          set({ error: err instanceof Error ? err.message : '未知錯誤' })
        }
      }

      if (pc.iceGatheringState !== 'complete') {
        const checkState = () => {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState)
            sendOffer()
          }
        }
        pc.addEventListener('icegatheringstatechange', checkState)
        setTimeout(() => {
          if (pc.iceGatheringState !== 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState)
            sendOffer()
          }
        }, 2000)
      } else {
        await sendOffer()
      }
    } catch (error) {
      console.error('觀看啟動失敗:', error)
      set({ error: error instanceof Error ? error.message : '未知錯誤' })
    }
  },

  stopWatching: async () => {
    console.log('正在停止觀看...')
    const { viewerPcRef } = get()
    if (viewerPcRef) {
      viewerPcRef.close()
      console.log('已關閉觀看 PeerConnection')
    }
    set({ viewerStream: null, viewerPcRef: null })
  },
}))
