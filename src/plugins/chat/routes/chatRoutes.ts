import { Router, Request, Response } from 'express';
import { ChatService } from '../services/ChatService';
import prisma from '../../../lib/prisma';

const router = Router();
const chatService = new ChatService();

// MediaMTX 身份驗證 Webhook
router.get('/stream/auth', (req, res) => {
  // MediaMTX 透過 ?path=$path&action=$action&$query 傳過來的東西
  const { path, action, key } = req.query; 

  console.log(`[Auth] Path: ${path}, Action: ${action}, Key: ${key}`);

  // 這裡的 'key' 就是你推流時 ?key=... 後面的值
  const EXPECTED_KEY = "sz6ak7swwdgpuxky";

  if (key === EXPECTED_KEY) {
      console.log("Auth Success!");
      return res.status(200).send("OK");
  } else {
      console.warn(`Auth Failed: Provided key [${key}] does not match.`);
      return res.status(401).send("Unauthorized");
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
let currentNgrokUrl = "Not Updated Yet";

// 1. 接收 Ngrok 網址的 API
router.post('/system/update-tunnel', (req, res) => {
    const { url } = req.body;
    if (url) {
      // 將 tcp://0.tcp.jp.ngrok.io:12345 轉換成 rtmp://...
      currentNgrokUrl = url.replace('tcp://', 'rtmp://');
      console.log(`[System] New RTMP URL: ${currentNgrokUrl}`);
      return res.status(200).json({ status: "updated", url: currentNgrokUrl });
  }
  res.status(400).send("Invalid URL");
});

// 2. 讓你隨時查看網址的 API (或直接做個簡單網頁)
// 給你自己看的 API
router.get('/api/system/get-tunnel', (req, res) => {
  res.json({ 
      rtmp_server: currentNgrokUrl,
      stream_key: "sz6ak7swwdgpuxky",
      full_url: `${currentNgrokUrl}/admin2?key=sz6ak7swwdgpuxky`
  });
});
export default router;
