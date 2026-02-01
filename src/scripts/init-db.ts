import prisma from '../lib/prisma';

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Initialize connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Run Prisma migrations
    console.log('🔄 Running Prisma migrations...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Prisma migrations executed successfully');
    } catch (migrationError) {
      console.log('⚠️  Note: Run "npx prisma migrate deploy" or "npx prisma migrate dev" manually if needed');
    }

    // Verify tables were created
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%' 
      AND tablename NOT LIKE '_prisma_%'
      ORDER BY tablename
    `;
    
    console.log('\n📊 Database tables:');
    tables.forEach((table) => {
      console.log(`   - ${table.tablename}`);
    });

    // 測試查詢
    const userCount = await prisma.user.count();
    const roomCount = await prisma.chatRoom.count();
    const messageCount = await prisma.chatMessage.count();
    const giftCount = await prisma.gift.count();
    const tokenCount = await prisma.token.count();
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

initDatabase();
