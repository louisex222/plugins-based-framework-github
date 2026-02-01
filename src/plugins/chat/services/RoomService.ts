import prisma from '../../../lib/prisma';
import { ChatRoom, ChatMessage} from '@prisma/client';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

export class RoomService {
// ---------- room start ----------
  // 創建房間在資料庫 (C)
  async createRoom(name:string,description:string,createdById:string,slug:string,avatarUrl:Buffer | null) {
   const room =await prisma.chatRoom.create({
      data: {
        id:uuidv4(),
        name,
        description,
        createdById,
        createdAt:dayjs().tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ssZ'),
        isLive:false,
        slug,
        streamKey: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10),
        avatarUrl:  avatarUrl as any,
      },
    });
    return room;
  }

  // 根據串流號取得房間 (R)
  async getRoomBySlug(slug: string): Promise<ChatRoom | null> {
    const data = await prisma.chatRoom.findUnique({
      where: { slug }
    });
    return data;
  }
  // 取得所有房間
  async getAllRooms(): Promise<ChatRoom[]> {
    const data =await prisma.chatRoom.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { messages: true },
    });
    return data;
  }
  // 更新所選房間
  async updateRoom(id: string, name?: string, description?: string): Promise<ChatRoom | null> {
    const updateData: { name?: string; description?: string | null } = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    try {
      return await prisma.chatRoom.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }
  // 刪除所選房間
  async deleteRoom(id: string): Promise<boolean> {
    try {
      await prisma.chatRoom.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
  // 取得所有上線聊天室
  async liveRoom(): Promise<ChatRoom[]> {
    const data = await prisma.chatRoom.findMany({
      where: { isLive: true }
    });
    return data.map((room)=>{
      if(room.avatarUrl){
        return {
          ...room,
          avatarUrl: `data:image/png;base64,${(room.avatarUrl as unknown as Buffer).toString('base64')}`
        } as any as ChatRoom;
      }
      return room;
    });
  }
  // 取得所有離線聊天室
  async offlineRoom(): Promise<ChatRoom[]> {
    const data = await prisma.chatRoom.findMany({
      where: { isLive: false }
    });
    return data.map((room)=>{
      if(room.avatarUrl){
        return {
          ...room,
          avatarUrl: `data:image/png;base64,${(room.avatarUrl as unknown as Buffer).toString('base64')}`
        } as any as ChatRoom;
      }
      return room;
    });
  }
// ---------- room end ----------

// ---------- message start ----------
  // 創建訊息知道是哪個用戶在哪間房間留言
  async createMessage(
    slug: string,
    userId: string,
    content: string,
    type?: string
  ): Promise<ChatMessage> 
  {
    // 檢查房間是否存在
    const room = await prisma.chatRoom.findUnique({
      where: { slug },
    });

    if (!room) {
      throw new Error('Room not found');
    }

    // 使用時同時創建訊息和更新房間的 updatedAt
    return await prisma.$transaction(async (tx) => {
      // 順便更新房間的 updatedAt
      await tx.chatRoom.update({
        where: { slug },
        data: { updatedAt: new Date() },
      });

      // 創建訊息
      return await tx.chatMessage.create({
        data: {
          id: uuidv4(),
          roomId: room.id,
          userId,
          content,
          type: type || null,
        },
      });
    });
  }
  // 取得所選房間
  async getMessagesByRoomId(roomId: string, limit?: number): Promise<ChatMessage[]> 
  {
    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return messages;
  }
// ---------- message end ----------
}




