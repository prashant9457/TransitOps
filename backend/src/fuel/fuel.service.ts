import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FuelService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.fuelLog.findMany({
      include: { vehicle: { select: { registrationNumber: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: any) {
    return this.prisma.fuelLog.create({
      data: {
        vehicleId: data.vehicleId,
        liters: Number(data.liters),
        cost: Number(data.cost),
        odometer: Number(data.odometer || 0),
      },
      include: { vehicle: true }
    });
  }
}
