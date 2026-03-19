const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnection() {
  try {
    const count = await prisma.lead.count();
    console.log(`✅ SUCCESS! Connected to Supabase perfectly. There are currently ${count} leads in the database.`);
  } catch (error) {
    console.error('❌ FAILURE! Could not connect to the database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
