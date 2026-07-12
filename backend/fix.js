const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.user.updateMany({
    where: { email: 'driver@transitops.com' },
    data: { name: 'John Doe' }
  });
  console.log('Fixed driver name!');
}
fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
