import prisma from '../lib/prisma';

async function checkTableStructure(tableName: string) {
  const tableInfo = await prisma.$queryRaw<Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
  }>>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;

  if (tableInfo.length > 0) {
    console.log(`\n📋 ${tableName} table structure:`);
    tableInfo.forEach((col) => {
    console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  } else {
    console.log(`⚠️  Table ${tableName} not found`);
  }
}

async function checkSchema() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    await checkTableStructure('users');
    await checkTableStructure('chat_rooms');
    await checkTableStructure('chat_messages');
    await checkTableStructure('gift');
    await checkTableStructure('token');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error checking schema:', error);
    await prisma.$disconnect().catch(() => {});
  }
}

checkSchema();
