import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.expense.findMany({
      include: { 
        vehicle: { select: { registrationNumber: true } },
        trip: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: any) {
    return this.prisma.expense.create({
      data: {
        vehicleId: data.vehicleId,
        tripId: data.tripId || null,
        type: data.type || 'OTHER',
        amount: Number(data.amount) || 0,
        description: data.description || '',
      },
      include: { vehicle: true, trip: true }
    });
  }
}
