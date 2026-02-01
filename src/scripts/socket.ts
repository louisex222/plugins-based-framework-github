import prisma from '../lib/prisma';
import { ChatRoom } from '@prisma/client';
// 封裝廣播邏輯
export const socket = (io: any) => {
    const broadcastLiveRooms = async () => {
      const liveRoom = await prisma.chatRoom.findMany({
          where: { isLive: true }
        });
      const liveData:ChatRoom[] = liveRoom.map((room)=>{
        if(room.avatarUrl){
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
      const offlineData:ChatRoom[] = offlineRooms.map((room)=>{
        if(room.avatarUrl){
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
    };

    //建立連接
    io.on('connection', (socket: any) => {
      // 建立傳送連接
      socket.on('sendMessage', async (message: any) => {
        // 傳送訊息給使用者
        io.to(message.room).emit('receiveMessage', message);
        io.emit('notificationMessage', message);
      });
      // 監聽加入房間
      socket.on('joinRoom', async (data: { slug: string; userName: string }) => {
        const { slug, userName } = data;
        console.log(`[Socket] User ${userName} (ID: ${socket.id}) joined room: ${slug}`);
        
        // --- 1. 防止「同個視窗」重複觸發 ---
        if (socket.rooms.has(slug)) {
          return;
        }

        // --- 2. 判定是否為「該帳號的第一個視窗」 ---
        const sockets = await io.in(slug).fetchSockets();
        const isUserAlreadyInRoom = sockets.some((s:any) => s.data.userName === userName);

        // 正式加入 Socket 房間
        socket.join(slug);
        socket.data.userName = userName;
        socket.data.currentRoom = slug;

        console.log(`[Socket] User ${userName} (ID: ${socket.id}) joined room: ${slug}`);

        try {
          if (!isUserAlreadyInRoom) {
            socket.to(slug).emit('userJoined', {
              userName,
              time: new Date().toLocaleTimeString(),
              message: `${userName} 進入了聊天室`
            });
          }

          // 更新在線人數：先嘗試以 slug 更新，如果不成功則可能 roomId 是 UUID
          const result = await prisma.chatRoom.updateMany({
            where: {
              slug: slug
            },
            data: {
              onlineCount: { increment: 1 },
            }
          });
          
          console.log(`[DB] Room ${slug} onlineCount incremented. Affected rows: ${result.count}`);
          await broadcastLiveRooms();
        } catch (error) {
          console.error('[DB Error] Error updating onlineCount on join:', error);
        }
      });

      // 監聽離開房間 (手動)
      socket.on('leaveRoom', async (data: { slug: string; userName: string }) => {
        const { slug, userName } = data;
        socket.leave(slug);
        console.log(`User ${userName} leave room ${slug}`);
        try {
          const result = await prisma.chatRoom.updateMany({
            where: {
              slug: slug
            },
            data: { onlineCount: { decrement: 1 } }
          });
          console.log(`[DB] Room ${slug} onlineCount decremented. Affected rows: ${result.count}`);

          // 獲取房間內「剩餘」的 Sockets
          const sockets = await io.in(slug).fetchSockets();
          const stillInRoom = sockets.some((s:any) => s.data.userName === userName && s.id !== socket.id);

          if (!stillInRoom) {
            socket.to(slug).emit('userLeave', {
              userName,
              time: new Date().toLocaleTimeString(),
              message: `${userName} 離開了聊天室`
            });
          }
          await broadcastLiveRooms();
        } catch (error) {
          console.error('Error updating onlineCount on leaveRoom:', error);
        }
      });

      // 斷線前處理 (可以獲取所在房間)
      socket.on('disconnecting', async () => {
        const rooms = Array.from(socket.rooms) as string[];
        const chatRooms = rooms.filter(id => id !== socket.id);
        const userName = socket.data.userName;

        for (const slug of chatRooms) {
          try {
            // 先減少在線人數
            const result = await prisma.chatRoom.updateMany({
              where: {
                slug: slug
              },
              data: { onlineCount: { decrement: 1 } }
            });
            console.log(`[DB] Room ${slug} onlineCount decremented on disconnect. Affected rows: ${result.count}`);

            // 檢查房間內是否還有該使用者的其他連線
            const sockets = await io.in(slug).fetchSockets();
            const stillInRoom = sockets.some((s:any) => s.data.userName === userName && s.id !== socket.id);

            if (!stillInRoom && userName) {
              socket.to(slug).emit('userLeave', {
                userName,
                time: new Date().toLocaleTimeString(),
                message: `${userName} 離開了聊天室`
              });
            }
            await broadcastLiveRooms();
          } catch (error) {
            console.error('Error updating onlineCount on disconnect:', error);
          }
        }
        
      });
      socket.on('liveStart', async (data: { slug: string; username: string }) => {
        const { slug, username } = data;
        
        try{
          io.to(slug).emit('userLive', {
            username,
            time: new Date().toLocaleTimeString(),
            message: `${username} 開始直播`
          });
          console.log(`User ${username} started live in room ${slug}`);
        }catch(error){
          console.error('Error updating onlineCount on liveStart:', error);
        }
      })
      socket.on('liveEnd', async (data: { slug: string; username: string }) => {
        const { slug, username } = data;
        try{
          io.to(slug).emit('userLeave', {
            time: new Date().toLocaleTimeString(),
            message:  `${username} 停止直播`
          });
          console.log(`User ${username} ended live`);
        }catch(error){
          console.error('Error updating onlineCount on liveEnd:', error);
        }
      })
      socket.on('activeRoom', async () => {
        await broadcastLiveRooms();
      });
      
      socket.on('offRoom', async () => {
        await broadcastLiveRooms();
      });

      socket.on('deviceData',async(data:any)=>{
        io.emit('deviceType',{
          ...data,
          ip:socket.handshake,
          time:new Date().toLocaleTimeString(),
        })
      })
      // 斷線
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });
}