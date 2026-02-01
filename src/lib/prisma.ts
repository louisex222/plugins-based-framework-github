import { PrismaClient } from '@prisma/client';

// 創建 Prisma Client 實例
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// 優雅關閉處理
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
