import prisma from '../../../lib/prisma'
import { ChatRoom } from '@prisma/client';

export class ChatService {
  /**
   * 驗證串流密鑰
   * @returns 回傳布林值代表驗證是否成功
   */
  async streamAuth(path: string, action: string, query: string): Promise<{ authorized: boolean; roomSlug?: string; providedKey?: string; expectedKey?: string; room?: ChatRoom | null }> {
    console.log(`[ChatService] Auth Request - Path: ${path}, Action: ${action}, Query: ${query}`);
    
    if (action !== "publish") return { authorized: true }; 

    // 路徑解析
    const roomSlug = path
      .replace(/\/(whip|whep|hls|rtmp)$/i, '')
      .split('/')
      .filter(Boolean)
      .pop();

    if (!roomSlug) {
      console.error(`[ChatService] 無法解析房間 Slug: ${path}`);
      return { authorized: false, roomSlug: '' };
    }

    const params = new URLSearchParams(query);
    const providedKey = params.get('key') || undefined;
    
    const room = await prisma.chatRoom.findUnique({
      where: { slug: roomSlug }
    });

    // 1. 如果房間不存在，允許推流 (handlePublish 會建立它)
    if (!room) {
      console.log(`[ChatService] 允許新房間推流: ${roomSlug}`);
      return { authorized: true, roomSlug, room: null };

    }

    // 2. 如果房間存在，但沒有設定金鑰，也允許推流
    if (!room.streamKey) {
      console.log(`[ChatService] 房間 ${roomSlug} 未設金鑰，允許推流`);
      return { authorized: true, roomSlug, room };

    }

    // 3. 檢查金鑰是否符合
    const isAuthorized = room.streamKey === providedKey;
    if (!isAuthorized) {
      console.warn(`[ChatService] 房間 ${roomSlug} 認證失敗: 預期 ${room.streamKey}, 收到 ${providedKey}`);
    } else {
      console.log(`[ChatService] 房間 ${roomSlug} 認證成功`);
    }

    return { 
      authorized: isAuthorized, 
      roomSlug, 
      providedKey, 
      expectedKey: room.streamKey || undefined,
      room
    };

  }




  /**
   * 處理房間開始直播
   */
  async handlePublish(slug: string, io: any): Promise<void> {
    if (!slug) return;
    
    // 修正：從路徑中提取真正的房間名稱，並移除 /whip 或 /whep 尾綴
    const roomSlug = slug
      .replace(/\/(whip|whep)$/, '')
      .split('/')
      .filter(Boolean)
      .pop();
    
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
    
    // 修正：從路徑中提取真正的房間名稱，並移除 /whip 或 /whep 尾綴
    const roomSlug = slug
      .replace(/\/(whip|whep)$/, '')
      .split('/')
      .filter(Boolean)
      .pop();

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
