const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLeads() {
    try {
        console.log('Checking for recent leads in the database...');
        const leads = await prisma.lead.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        });

        if (leads.length === 0) {
            console.log('No leads found in the database.');
        } else {
            console.log(`Found ${leads.length} recent leads:`);
            leads.forEach(lead => {
                console.log(`- [${lead.createdAt.toISOString()}] ${lead.name} (${lead.email}) | Lead ID: ${lead.leadgenId}`);
            });
        }
    } catch (error) {
        console.error('Error fetching leads:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLeads();
