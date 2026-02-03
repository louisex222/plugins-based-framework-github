import prisma from '../../../lib/prisma'
import { ChatRoom } from '@prisma/client';

export class ChatService {
  /**
   * 驗證串流密鑰
   * @returns 回傳布林值代表驗證是否成功
   */
  async streamAuth(input: {
    path?: string;
    action?: string;
    query?: string;
    user?: string;
    password?: string;
    key?: string;
  } | string): Promise<{
    authorized: boolean;
    roomSlug?: string;
    providedKey?: string;
    expectedKey?: string;
    room?: ChatRoom | null;
  }> {
    // ---- normalize input ----
    const payload =
      typeof input === 'string'
        ? { query: input, key: input }
        : (input ?? {});

    const rawPath = (payload.path ?? '').toString();
    const rawQuery = (payload.query ?? payload.key ?? '').toString(); // MediaMTX 會提供 query，例如 "key=xxx"
    const user = payload.user?.toString();
    const password = payload.password?.toString();

    // 由 path 推導 room slug（與 publish/unpublish 同邏輯）
    const roomSlug = rawPath
      .replace(/\/(whip|whep)$/, '')
      .split('/')
      .filter(Boolean)
      .pop();

      // 從 query 解析 key；若沒有，退回 password / user
      let providedKey: string | undefined;
      try {
        const params = new URLSearchParams(rawQuery);
        providedKey = params.get('key') ?? undefined;
        console.log(rawQuery,params,providedKey);
    } catch {
      // ignore
    }
    providedKey = providedKey || password || user || undefined;

    console.log(
      `[ChatService] StreamAuth req: path="${rawPath}" slug="${roomSlug ?? ''}" action="${payload.action ?? ''}" provided="${providedKey ? '***' : 'none'}"`
    );

    if (!roomSlug) {
      return { authorized: false, roomSlug: '', providedKey };
    }

    const room = await prisma.chatRoom.findUnique({
      where: { slug: roomSlug },
    });

    const expectedKey = room?.streamKey ?? undefined;
    if (!expectedKey || !providedKey) {
      return { authorized: false, roomSlug, providedKey, expectedKey, room };
    }

    const authorized = providedKey === expectedKey;
    return { authorized, roomSlug, providedKey, expectedKey, room };
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
