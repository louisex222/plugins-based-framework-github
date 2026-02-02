import { Router, Request, Response } from 'express';
import { ChatService } from '../services/ChatService';
import prisma from '../../../lib/prisma';

const router = Router();
const chatService = new ChatService();

// MediaMTX 身份驗證 Webhook
router.post("/stream/auth", async (req: Request, res: Response) => {
  try {
    const { path, action, query } = req.body;
    const { authorized, roomSlug, providedKey, expectedKey, room } = await chatService.streamAuth(path, action, query);
    
    if (authorized) {
      return res.status(200).end();
    }
    
    console.warn(`[StreamAuth] Rejected: slug=${roomSlug}, provided=${providedKey}, expected=${expectedKey}`);
    return res.status(401).json({ 
      error: "Invalid stream key", 
      debug: { roomSlug, providedKey, room: room ? { id: room.id, slug: room.slug } : null } 
    });


  } catch (error) {
    console.error('[roomRoutes] auth error:', error);
    return res.status(500).end();
  }
});

// MediaMTX 開始推流 Webhook
router.post("/stream/publish", async (req: Request, res: Response) => {
  try {
    const io = req.app.get('io');
    const { slug } = req.body;
    
    if (!slug) return res.status(400).end();
    
    await chatService.handlePublish(slug, io);
    return res.status(200).end();
  } catch (error) {
    console.error('[roomRoutes] publish error:', error);
    return res.status(500).end();
  }
});

// MediaMTX 停止推流 Webhook
router.post("/stream/unpublish", async (req: Request, res: Response) => {
  try {
    const io = req.app.get('io');
    const { slug } = req.body;
    
    if (!slug) return res.status(400).end();
    
    await chatService.handleUnpublish(slug, io);
    return res.status(200).end();
  } catch (error) {
    console.error('[roomRoutes] unpublish error:', error);
    return res.status(500).end();
  }
});

// 偵錯用：列出所有房間 (正式環境建議移除)
router.get("/debug/rooms", async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.chatRoom.findMany();
    return res.json(rooms.map(r => ({ id: r.id, slug: r.slug, key: r.streamKey })));
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
