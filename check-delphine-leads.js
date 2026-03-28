const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Checking leads for Delphine Studios...')
  try {
    const leads = await prisma.lead.findMany({
      where: {
        pageName: { contains: 'Delphine', mode: 'insensitive' }
      },
      orderBy: { createdAt: 'desc' }
    })
    console.log(`Found ${leads.length} leads for Delphine Studios.`)
    leads.forEach(l => {
      console.log(`- ID: ${l.id}, Name: ${l.name}, Created: ${l.createdAt}, Form: ${l.formName}`)
    })
  } catch (error) {
    console.error('Prisma Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
