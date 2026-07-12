import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // We fetch all users. If they are a driver, we also try to find their driver profile to merge stats.
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const drivers = await this.prisma.driver.findMany();

    return users.map(u => {
      const driverProfile = drivers.find(d => d.name.toLowerCase() === u.name.toLowerCase());
      return {
        ...u,
        licenseNumber: driverProfile?.licenseNumber || null,
        safetyScore: driverProfile?.safetyScore || null,
        status: driverProfile?.status || null,
      };
    });
  }
}
