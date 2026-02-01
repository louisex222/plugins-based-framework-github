import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const FeedModule: React.FC = () => {
  const dummyFeed = [
    { id: 1, content: '今天大家都在討論 Kpop!' },
    { id: 2, content: '新聊天室『React 開發者』已開啟' },
  ]
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
          <CardDescription>Feed Module</CardDescription>
        </CardHeader>
        <CardContent>
          {dummyFeed.map(feed => (
            <div key={feed.id}>{feed.content}</div>
          ))}
        </CardContent>
        <CardFooter>
          <p>Feed Module Footer</p>
        </CardFooter>
      </Card>
    </div>
  )
}
