import React from 'react'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useTranslation } from 'react-i18next'

export const TrendsModule: React.FC = () => {
  const { t } = useTranslation()
  const chartConfig = {
    onlinePeople: {
      label: t('onlinepeople'),
      color: 'var(--chart-1)',
    },
    interactive: {
      label: t('interactive'),
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig
  const chartData = React.useMemo(() => {
    const rawData = [
      { day: '2025-12-17', onlinePeople: 4000, interactive: 2400 },
      { day: '2025-12-18', onlinePeople: 2400, interactive: 2400 },
      { day: '2025-12-19', onlinePeople: 2400, interactive: 2400 },
      { day: '2025-12-20', onlinePeople: 2400, interactive: 2400 },
      { day: '2025-12-21', onlinePeople: 2400, interactive: 2400 },
    ]

    const map = new Map()
    rawData.forEach(item => {
      if (!map.has(item.day)) {
        map.set(item.day, item)
      }
    })
    return Array.from(map.values())
  }, [])

  return (
    <div className="p-4 border rounded shadow">
      <ChartContainer config={chartConfig}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray={`${chartData.length},${chartData.length}`} />
          <XAxis dataKey="day" tickLine={true} tickMargin={10} axisLine={true} />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="onlinePeople" fill="var(--color-onlinePeople)" />
          <Bar dataKey="interactive" fill="var(--color-interactive)" />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
