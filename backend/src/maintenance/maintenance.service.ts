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
      
      // Auto-log the expense if completed with a cost
      if (Number(cost) > 0) {
        await this.prisma.expense.create({
          data: {
            vehicleId,
            type: 'MAINTENANCE',
            amount: Number(cost),
            description: `Maintenance: ${issue}`
          }
        });
      }
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

  async update(id: string, data: any) {
    try {
      const { status, cost } = data;
      
      const log = await this.prisma.maintenanceLog.findUnique({ where: { id } });
      if (!log) throw new NotFoundException('Maintenance log not found');

      if (status === 'IN_PROGRESS') {
        await this.prisma.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'IN_SHOP' } });
      } else if (status === 'COMPLETED') {
        await this.prisma.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'AVAILABLE' } });

        const finalCost = cost !== undefined ? Number(cost) : log.cost;
        if (finalCost > 0) {
          await this.prisma.expense.create({
            data: {
              vehicleId: log.vehicleId,
              type: 'MAINTENANCE',
              amount: finalCost,
              description: `Maintenance: ${log.issue}`
            }
          });
        }
      }

      return await this.prisma.maintenanceLog.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(cost !== undefined && !isNaN(Number(cost)) && { cost: Number(cost) }),
          ...(status === 'COMPLETED' ? { closedAt: new Date() } : {})
        },
        include: { vehicle: true }
      });
    } catch (error) {
      console.error('Error in maintenance update:', error);
      throw error;
    }
  }
}
