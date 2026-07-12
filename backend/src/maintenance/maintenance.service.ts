import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.maintenanceLog.findMany({
      include: { vehicle: { select: { registrationNumber: true, model: true } } },
      orderBy: { openedAt: 'desc' }
    });
  }

  async create(data: any) {
    const { vehicleId, issue, cost, status } = data;
    
    // Auto-update vehicle status if status is IN_SHOP or AVAILABLE
    if (status === 'IN_PROGRESS') {
      await this.prisma.vehicle.update({ where: { id: vehicleId }, data: { status: 'IN_SHOP' } });
    } else if (status === 'COMPLETED') {
      await this.prisma.vehicle.update({ where: { id: vehicleId }, data: { status: 'AVAILABLE' } });
    }

    return this.prisma.maintenanceLog.create({
      data: {
        vehicleId,
        issue,
        cost: Number(cost) || 0,
        status: status || 'OPEN',
        ...(status === 'COMPLETED' ? { closedAt: new Date() } : {})
      },
      include: { vehicle: true }
    });
  }
}
