import prisma from '../../../lib/prisma'
import { ChatRoom } from '@prisma/client';

export class ChatService {
  /**
   * 驗證串流密鑰
   * @returns 回傳布林值代表驗證是否成功
   */
  async streamAuth(path: string, action: string, query: string): Promise<boolean> {
    if (action !== "publish") return true;
    
    const roomSlug = path.startsWith('/') ? path.split('/').filter(Boolean).pop() : path;
    if (!roomSlug) return false;

    // MediaMTX 的 query 格式通常是 "key=value&..." 的字串
    const params = new URLSearchParams(query);
    const providedKey = params.get('key');
    const room = await prisma.chatRoom.findUnique({
      where: { slug: roomSlug }
    });

    return !!(room && room.streamKey === providedKey);
  }

  /**
   * 處理房間開始直播
   */
  async handlePublish(slug: string, io: any): Promise<void> {
    if (!slug) return;
    
    const roomSlug = slug.startsWith('/') ? slug.split('/').filter(Boolean).pop() : slug.split('/').pop();
    if (!roomSlug) return;

    const room = await prisma.chatRoom.findUnique({
      where: { slug: roomSlug }
    });
  
    if (room) {
      await prisma.chatRoom.update({
        where: { slug: roomSlug },
        data: { isLive: true, createdAt: new Date(), onlineCount: 1 },
      });
    } else {
      await prisma.chatRoom.create({
        data: {
          slug: roomSlug,
          name: roomSlug,
          isLive: true,
          createdAt: new Date(),
        },
      });
    }
    console.log(`[RoomService] 房間已上線: ${roomSlug}`);
    await this.broadcastLiveRooms(io);
  }

  /**
   * 處理房間停止直播
   */
  async handleUnpublish(slug: string, io: any): Promise<void> {
    if (!slug) return;
    
    const roomSlug = slug.startsWith('/') ? slug.split('/').filter(Boolean).pop() : slug.split('/').pop();
    if (!roomSlug) return;

    await prisma.chatRoom.update({
      where: { slug: roomSlug },
      data: { isLive: false, onlineCount: 0 },
    });

    console.log(`[RoomService] ⚪ 房間 ${roomSlug} 已下線`);
    await this.broadcastLiveRooms(io);
  }

  /**
   * 廣播最新直播房間列表 (私有方法)
   */
  private async broadcastLiveRooms(io: any): Promise<void> {
    try {
      const liveRooms = await prisma.chatRoom.findMany({
        where: { isLive: true }
      });
      
      const liveData: ChatRoom[] = liveRooms.map((room) => {
        if (room.avatarUrl) {
          return {
            ...room,
            avatarUrl: `data:image/png;base64,${(room.avatarUrl as unknown as Buffer).toString('base64')}`
          } as any as ChatRoom;
        }
        return room;
      });

      const offlineRooms = await prisma.chatRoom.findMany({
        where: { isLive: false }
      });

      const offlineData: ChatRoom[] = offlineRooms.map((room) => {
        if (room.avatarUrl) {
          return {
            ...room,
            avatarUrl: `data:image/png;base64,${(room.avatarUrl as unknown as Buffer).toString('base64')}`
          } as any as ChatRoom;
        }
        return room;
      });

      io.emit('roomData', liveData);
      io.emit('onlineRooms', liveData);
      io.emit('offlineRooms', offlineData);
    } catch (error) {
      console.error('[RoomService] 廣播失敗:', error);
    }
  }
}
