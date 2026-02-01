import React from 'react'
import { User, FileText, Users, Activity } from 'lucide-react'

export const UserStatsModule: React.FC = () => {
  const stats: {
    label: string
    value: string | number
    icon: React.ComponentType<{ className?: string }>
    color: string
  }[] = [
    { label: '文章總數', value: '128', icon: FileText, color: 'text-blue-500' },
    { label: '粉絲人數', value: '3,405', icon: Users, color: 'text-green-500' },
    {
      label: '互動率',
      value: `${((128 / 3405) * 100).toFixed(2)}%`,
      icon: Activity,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="p-4 border rounded shadow bg-white dark:bg-slate-950 h-full">
      <h2 className="font-bold mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        個人數據
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-center"
          >
            <stat.icon className={`w-6 h-6 mb-1 ${stat.color}`} />
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
