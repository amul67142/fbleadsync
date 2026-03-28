const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

async function main() {
  console.log('Querying leads from March 20 to March 28...')
  try {
    const leads = await prisma.lead.findMany({
      where: {
        createdAt: {
          gte: new Date('2026-03-20'),
          lte: new Date('2026-03-29')
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    let report = `Leads Found: ${leads.length}\n`
    leads.forEach(l => {
      report += `- ID: ${l.id}, Name: ${l.name}, Created: ${l.createdAt}, Page: ${l.pageName}, Form: ${l.formName}\n`
    })
    
    fs.writeFileSync('recent_leads_report.txt', report, 'utf8')
    console.log('Report saved to recent_leads_report.txt')
  } catch (error) {
    console.error('Prisma Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
