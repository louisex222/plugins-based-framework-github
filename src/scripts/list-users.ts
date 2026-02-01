import prisma from '../lib/prisma';

async function listUsers() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (users.length > 0) {
      console.log('\n👤 Existing Users:');
      users.forEach(user => {
      console.log(`   ID: ${user.id} | Name: ${user.name} | Email: ${user.email}`);
      });
    } else {
      console.log('\n⚠️ No users found in the database. Please register a user first.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error listing users:', error);
    await prisma.$disconnect().catch(() => {});
  }
}

listUsers();
