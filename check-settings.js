const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Checking Settings table for META_PAGE_ACCESS_TOKEN...')
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'META_PAGE_ACCESS_TOKEN' }
    })
    if (setting) {
      console.log('Found token in Settings table:', setting.value.substring(0, 10) + '...')
    } else {
      console.log('META_PAGE_ACCESS_TOKEN NOT found in Settings table.')
    }
    
    const allSettings = await prisma.setting.findMany()
    console.log('All Settings keys:', allSettings.map(s => s.key))
    
  } catch (error) {
    console.error('Prisma Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
