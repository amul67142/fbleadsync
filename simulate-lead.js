const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateLead() {
  console.log('🚀 Simulating a new lead from Meta...');
  
  const mockLead = {
    leadgenId: `test_${Date.now()}`,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555 0123',
    adName: 'Summer Promo 2024',
    adId: 'ad_123456789',
    formId: 'form_987654321',
    pageId: 'page_112233',
    pageName: 'RealVibe Digital',
    status: 'new'
  };

  try {
    const lead = await prisma.lead.create({
      data: mockLead
    });
    console.log('✅ Lead saved successfully to Supabase!');
    console.log('------------------------------------');
    console.log(`ID: ${lead.id}`);
    console.log(`Name: ${lead.name}`);
    console.log(`Email: ${lead.email}`);
    console.log('------------------------------------');
    console.log('Check your dashboard now: http://localhost:3000/dashboard');
  } catch (error) {
    console.error('❌ Error saving lead:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateLead();
