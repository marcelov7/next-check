const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function measure() {
  try {
    console.log('Starting DB measure...');
    const t0 = Date.now();
    // simple lightweight query
    const beforeConn = Date.now();
    const res = await prisma.$queryRaw`SELECT 1 as ok`;
    const t1 = Date.now();
    console.log('Query result sample:', res);
    console.log('Time for simple SELECT 1 (ms):', t1 - t0);

    // measure a slightly heavier query: count of areas
    const t2 = Date.now();
    const count = await prisma.area.count();
    const t3 = Date.now();
    console.log('Areas count:', count);
    console.log('Time for COUNT Areas (ms):', t3 - t2);

    // run same count again to see subsequent call
    const t4 = Date.now();
    const count2 = await prisma.area.count();
    const t5 = Date.now();
    console.log('Areas count second:', count2);
    console.log('Time for COUNT Areas 2nd (ms):', t5 - t4);
  } catch (e) {
    console.error('Error measuring DB:', e);
  } finally {
    await prisma.$disconnect();
  }
}

measure();
