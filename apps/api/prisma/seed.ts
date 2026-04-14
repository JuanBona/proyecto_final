import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'traveler@test.com' },
    update: {},
    create: { email: 'traveler@test.com', passwordHash: hash, role: 'traveler' },
  });

  await prisma.user.upsert({
    where: { email: 'approver@test.com' },
    update: {},
    create: { email: 'approver@test.com', passwordHash: hash, role: 'approver' },
  });

  console.log('Seed completo: traveler@test.com y approver@test.com con password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
