import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  console.log('Initializing seed application context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  const usersToSeed = [
    { name: 'Admin', email: 'admin@transitops.com', password: 'Password123!', role: Role.ADMIN },
    { name: 'Fleet Manager', email: 'fleet@transitops.com', password: 'Password123!', role: Role.FLEET_MANAGER },
    { name: 'Driver', email: 'driver@transitops.com', password: 'Password123!', role: Role.DRIVER },
    { name: 'Safety Officer', email: 'safety@transitops.com', password: 'Password123!', role: Role.SAFETY_OFFICER },
    { name: 'Financial Analyst', email: 'finance@transitops.com', password: 'Password123!', role: Role.FINANCIAL_ANALYST },
  ];

  for (const u of usersToSeed) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exists) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
        },
      });
      console.log(`Created user: ${u.email} with role: ${u.role}`);
    } else {
      console.log(`User already exists: ${u.email}`);
    }
  }

  await app.close();
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
