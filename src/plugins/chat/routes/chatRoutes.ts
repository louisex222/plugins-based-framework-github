import { Router, Request, Response } from 'express';
import { ChatService } from '../services/ChatService';
import prisma from '../../../lib/prisma';

const router = Router();
const chatService = new ChatService();

// MediaMTX 身份驗證 Webhook
router.post("/stream/auth", async (req: Request, res: Response) => {
  try {
    // MediaMTX (authMethod: http) 會用 POST 並送 JSON body，欄位包含：
    // user, password, token, ip, action, path, protocol, id, query
    const { path, action, query, user, password } = req.body ?? {};
    const { authorized, roomSlug, providedKey, expectedKey, room } =
      await chatService.streamAuth({ path, action, query, user, password });

    
    if (authorized) {
      return res.status(200).end();
    }

    // 認證失敗日誌（避免只看到 401 不知道原因）
    const logMsg =
      `[StreamAuth] Rejected: slug=${roomSlug ?? 'unknown'}, provided=${providedKey || 'none'}, expected=${expectedKey || 'none'}`;
    console.warn(logMsg);

    return res.status(401).json({
      error: "Invalid stream key",
      message: "Provide a valid stream key. For WHIP/WHEP, pass it via '?key=...'. For RTMP/RTSP, pass it as password (or user).",
      debug: {
        roomSlug,
        providedKey,
        expectedKey: expectedKey ? '***' : null, // 不直接回傳真正 key
        room: room ? { id: room.id, slug: room.slug } : null,
      },
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
