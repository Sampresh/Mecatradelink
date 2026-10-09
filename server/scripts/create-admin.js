// Promote an existing user to ADMIN: node scripts/create-admin.js someone@example.com
import { PrismaClient } from '@prisma/client';
import '../src/config/env.js';

const email = process.argv[2]?.toLowerCase();
if (!email) {
  console.error('Usage: node scripts/create-admin.js <email>');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
  console.log(`✔ ${user.email} is now an admin`);
} catch {
  console.error(`✘ no user with email ${email}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
