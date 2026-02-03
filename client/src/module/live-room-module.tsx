import { Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRef, useEffect } from 'react'
import { useLiveStore } from '@/zustand/livestore'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const LiveRoomModule: React.FC<{
  slug: string
  streamNumber?: string
  username?: string
}> = ({ slug, streamNumber, username }) => {
  const { isLive, startLive, stopLive, stream, viewerStream, startWatching, stopWatching } =
    useLiveStore()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const userdata = JSON.parse(localStorage.getItem('userdata') || '')
  const { streamkey } = useParams()
  console.log(`streamNumber: ${streamNumber}`);
  const { t } = useTranslation()
  // 當直播主開始直播時，自動綁定本地預覽
  useEffect(() => {
    if (videoRef.current && stream && isLive) {
      videoRef.current.srcObject = stream
    }
  }, [stream, isLive])

  // 當非直播主進入房間時，或另開視窗，應嘗試觀看
  useEffect(() => {
    // 如果本地沒在開播，但進入此模組，嘗試向伺服器拉流
    if (!isLive) {
      startWatching(slug)
    }

    return () => {
      stopWatching()
    }
  }, [slug, isLive, startWatching, stopWatching])

  // 綁定觀看串流
  useEffect(() => {
    if (videoRef.current && viewerStream && !isLive) {
      videoRef.current.srcObject = viewerStream
    }
  }, [viewerStream, isLive])

  return (
    <div className="relative">
      <div className="pl-2 text-2xl font-bold absolute top-3 right-3 z-50">
        {isLive ? <Radio /> : ''}
      </div>
      {/* 根據角色顯示不同的影片樣式 */}
      {isLive ? (
        <video className="w-full h-full scale-x-[-1]" ref={videoRef} muted autoPlay playsInline />
      ) : viewerStream ? (
        <video className="w-full h-full" ref={videoRef} controls autoPlay playsInline />
      ) : (
        <div className="w-full aspect-video bg-black flex items-center justify-center text-white">
          {t('waiting for the live stream to start')}
        </div>
      )}

      <div className="p-4 flex gap-2">
        {userdata.account === streamkey ? (
          <>
            {isLive ? (
              <Button onClick={() => stopLive(slug, username)}>
                {t('ending the live stream')}
              </Button>
            ) : (
              <Button onClick={() => startLive(slug, streamNumber, username)}>
                {t('starting the live stream')}
              </Button>
            )}
          </>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}
