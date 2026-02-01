import { Router, Request, Response } from 'express';
import { RoomService } from '../services/RoomService';
import multer from 'multer';
import { authMiddleware } from '../../../middleware/authMiddleware';

const upload = multer({
    storage:multer.memoryStorage(),
})
const router = Router();
const roomService = new RoomService();

// 創建聊天室
router.post('/rooms', (upload.single('avatarUrl')as any), async (req: Request, res: Response) => {
  try {
    const { name,description,createdById ,slug} = req.body;
    const file = req.file;
    const avatarBuffer = file? file.buffer : null;
    if (!slug) {
      return res.status(400).json({ error: 'Room slug and streamKey are required' });
    }
    // 服務層資料庫
    const room = await roomService.createRoom(name,description,createdById,slug,avatarBuffer);
    const status ={
      status:200,
      data:room,
      message: "Create Room",
      code: "ADD_ROOM_SUCCESS"
    };
    return res.json(status);
  } catch (error: any) {
    const status ={
      status:500,
      data:null,
      message: "伺服器內部錯誤",
      code: "SERVER_INTERNAL_ERROR"
    };
    return res.json(status);
  }
});
// 取得所有聊天室
router.get('/rooms',authMiddleware, async (req: Request, res: Response) => {
  try {
    const rooms = await roomService.getAllRooms();
    const status ={
      status:200,
      data:rooms,
      message: "Get All Rooms",
      code: "success"
    }
    return res.json(status);
  } catch (error: any) {
    const status = {
      status:500,
      data:null,
      message: "伺服器內部錯誤",
      code: "SERVER_INTERNAL_ERROR"
    }
    return res.json(status);
  }
});

// 根據 slug 取得聊天室
router.get('/rooms/:slug', async (req: Request, res: Response) => {
    try {
      const room = await roomService.getRoomBySlug(req.params.slug);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      const status = {
        status:200,
        data:room,
        message: "Get Room By Slug",
        code: "GET_ROOM_BY_SLUG_SUCCESS"
      }
      return res.json(status);
    } catch (error: any) {
      const status = {
        status:500,
        data:null,
        message: "伺服器內部錯誤",
        code: "SERVER_INTERNAL_ERROR"
      }
      return res.json(status);
    }
  });
// -----------聊天室功能-----------
// 建立刪除聊天室
router.delete('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const success = await roomService.deleteRoom(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Room not found' });
    }
    const status ={
      status:200,
      data:null,
      message: "Delete Room",
      code: "DELETE_ROOM_SUCCESS"
    }
    return res.json(status);
  } catch (error: any) {
      const status ={
        status:500,
        data:null,
        message: "伺服器內部錯誤",
        code: "SERVER_INTERNAL_ERROR"
      }
    return res.json(status);
  }
});
// 取得所有上線聊天室
router.get('/room/online',authMiddleware , async (req: Request, res: Response) => {
  try {
    const rooms = await roomService.liveRoom();
    const status ={
      status:200,
      data:rooms,
      message: "Get Live Rooms",
      code: "success"
    }
    return res.status(200).json(status);
  } catch (error: any) {
    const status = {
      status:500,
      data:null,
      message: "伺服器內部錯誤",
      code: "SERVER_INTERNAL_ERROR"
    }
    return res.json(status);
  }
});
// 取得所有離線聊天室
router.get('/room/offline' ,authMiddleware, async (req: Request, res: Response) => {
  try {
    const rooms = await roomService.offlineRoom();
    const status ={
      status:200,
      data:rooms,
      message: "Get Offline Rooms",
      code: "success"
    }
    return res.status(200).json(status);
  } catch (error: any) {
    const status = {
      status:500,
      data:null,
      message: "伺服器內部錯誤",
      code: "SERVER_INTERNAL_ERROR"
    }
    return res.json(status);
  }
});
// ----------訊息功能----------
// 建立新增訊息的router跟資料庫
// router.post('/rooms/:slug/messages', async (req: Request, res: Response) => {
//   try {
//     const {userId, content, type } = req.body;
//     console.log(req.params)
//     const slug = req.params.slug;
//     if (!userId || !content) {
//       return res.status(400).json({ error: 'User ID and content are required' });
//     }
//     const message = await chatService.createMessage(
//       slug,
//       userId,
//       content,
//       type
//     );
//     res.status(200).json(message);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// });
// // 建立取得房間訊息的router跟資料庫
// router.get('/rooms/:roomId/messages', async (req: Request, res: Response) => {
//   try {
//     const {roomId ,limit} = req.body;
//     const messages = await chatService.getMessagesByRoomId(roomId, limit);
//     return res.status(200).json(messages);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// });



export default router;
