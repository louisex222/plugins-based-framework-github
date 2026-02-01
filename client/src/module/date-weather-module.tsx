import React, { useEffect, useState } from 'react'
import { CloudSun, CalendarClock } from 'lucide-react'

export const DateWeatherModule: React.FC = () => {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="p-4 border rounded shadow flex flex-col justify-between h-full bg-linear-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div>
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <CalendarClock className="w-5 h-5" />
          時間與天氣
        </h2>
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {date.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <CloudSun className="w-8 h-8 text-orange-400" />
        <div>
          <div className="font-semibold">台北市</div>
          <div className="text-sm text-gray-500">26°C 多雲</div>
        </div>
      </div>
    </div>
  )
}
