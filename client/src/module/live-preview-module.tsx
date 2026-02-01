import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STREAM_URL } from '@/config/env'

interface LivePreviewModuleProps {
  slug: string
  streamKey: string
}

export const LivePreviewModule: React.FC<LivePreviewModuleProps> = ({ slug, streamKey }) => {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setScreenshot(dataUrl)
        setLoading(false)

        // 擷取到畫面後即可關閉連線
        if (pcRef.current) {
          pcRef.current.close()
          pcRef.current = null
        }
      }
    }
  }

  useEffect(() => {
    let isMounted = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined
    let retryCount = 0

    const startWatching = async () => {
      try {
        setLoading(true)
        setError(null)

        // 設定全局逾時
        timeoutTimer = setTimeout(() => {
          if (isMounted && !screenshot) {
            setError('擷取逾時 (串流可能未就緒)')
            setLoading(false)
            if (pcRef.current) {
              pcRef.current.close()
              pcRef.current = null
            }
          }
        }, 10000)

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        })
        pcRef.current = pc

        pc.ontrack = event => {
          if (videoRef.current && isMounted) {
            const video = videoRef.current

            // 先綁定事件處理，確保不會漏掉
            const handleLoad = () => {
              if (!isMounted || screenshot) return
              if (video.videoWidth > 0) {
                if (timer) clearTimeout(timer)
                timer = setTimeout(() => {
                  if (isMounted) {
                    captureFrame()
                    if (timeoutTimer) clearTimeout(timeoutTimer)
                  }
                }, 1000)
              } else if (retryCount < 10) {
                retryCount++
                if (timer) clearTimeout(timer)
                timer = setTimeout(handleLoad, 500)
              }
            }

            video.onloadeddata = handleLoad
            video.onplaying = handleLoad
            video.onresize = handleLoad
            video.srcObject = event.streams[0]

            // 強制執行播放
            video.play().catch(e => console.warn('Auto-play failed:', e))
          }
        }

        pc.addTransceiver('video', { direction: 'recvonly' })
        pc.addTransceiver('audio', { direction: 'recvonly' })

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const sendOffer = async () => {
          if (!isMounted) return
          try {
            const url = streamKey
              ? `${STREAM_URL}/${slug}/whep?key=${streamKey}`
              : `${STREAM_URL}/${slug}/whep`
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/sdp' },
              body: pc.localDescription?.sdp,
            })

            if (!res.ok) throw new Error('MediaMTX 拒絕連線')

            const answerSdp = await res.text()
            if (isMounted) {
              await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
            }
          } catch (err) {
            if (isMounted) {
              setError((err as Error).message)
              setLoading(false)
            }
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
          }, 1500)
        } else {
          await sendOffer()
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message)
          setLoading(false)
        }
      }
    }

    startWatching()

    return () => {
      isMounted = false
      if (timer) clearTimeout(timer)
      if (timeoutTimer) clearTimeout(timeoutTimer)
      if (pcRef.current) {
        pcRef.current.close()
        pcRef.current = null
      }
    }
  }, [slug, streamKey, screenshot])

  return (
    <div className="w-full aspect-video bg-black rounded-md overflow-hidden relative group">
      <canvas ref={canvasRef} className="hidden" />

      {/* 隱藏的影片標籤，僅用於截圖 */}
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />

      {loading && !screenshot && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs bg-slate-900/80 z-10">
          {t('capturing')}
        </div>
      )}

      {error && !screenshot ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-[10px] p-2 text-center bg-slate-900">
          <span>{t('unable to obtain screenshot')}</span>
          <span className="mt-1 opacity-50">{error}</span>
        </div>
      ) : screenshot ? (
        <img
          src={screenshot}
          alt={t('live snapshot')}
          className="w-full h-full object-cover transition-opacity duration-500 opacity-100"
        />
      ) : (
        <div className="w-full h-full bg-slate-900" />
      )}

      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
        {t('live snapshot')}
      </div>
    </div>
  )
}
