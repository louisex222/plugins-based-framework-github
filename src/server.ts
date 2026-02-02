import express, { Express } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import prisma from './lib/prisma';
import chatRoutes from './plugins/chat/routes/chatRoutes';
import roomRoutes from './plugins/chat/routes/roomRoutes';
import userRoutes from './plugins/chat/routes/userRoutes';
import serverRoutes from './plugins/chat/routes/serverRoutes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socket} from './scripts/socket';
// https://socket.io/zh-CN/docs/v4/client-socket-instance/
dotenv.config();

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3001;
// Middleware
app.set('io', io);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API chat
app.use('/api', chatRoutes);
// API room
app.use('/api', roomRoutes);
// API user
app.use('/api', userRoutes);

app.use('/api', serverRoutes);

// --- MediaMTX 串流相關 API ---
// 認證 API: 預設允許所有連線 (生產環境建議加入金鑰檢查)
app.post('/api/stream/auth', (req, res) => {
  console.log('MediaMTX Auth Request:', req.body);
  res.status(200).send('OK');
});

// 直播開始通知
app.post('/api/stream/publish', (req, res) => {
  const { slug } = req.body;
  console.log(`直播開始: ${slug}`);
  // 這裡可以透過 Socket.io 通知所有用戶直播開始
  io.emit('liveStarted', { slug });
  res.status(200).json({ status: 'success' });
});

// 直播結束通知
app.post('/api/stream/unpublish', (req, res) => {
  const { slug } = req.body;
  console.log(`直播結束: ${slug}`);
  io.emit('liveEnded', { slug });
  res.status(200).json({ status: 'success' });
});
// ----------------------------

// Initialize database and start server
async function startServer() {
  try {
    // 測試資料庫連接
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    socket(io)
    // Start server
    server.listen(Number(PORT), () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api/chat`);
    });
    

  } catch (error: any) {
    console.error('❌ Error starting server:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});
