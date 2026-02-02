import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('正在檢查並清理異常房間資料...');
  
  // 找出 slug 包含 whip 或 whep 的房間
  const badRooms = await prisma.chatRoom.findMany({
    where: {
      OR: [
        { slug: { contains: 'whip' } },
        { slug: { contains: 'whep' } }
      ]
    }
  });

  if (badRooms.length > 0) {
    console.log(`找到 ${badRooms.length} 個異常房間:`, badRooms.map(r => r.slug));
    for (const room of badRooms) {
      console.log(`正在刪除: ${room.slug}`);
      await prisma.chatRoom.delete({ where: { id: room.id } });
    }
    console.log('✅ 清理完成。');
  } else {
    console.log('查無異常房間。');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
