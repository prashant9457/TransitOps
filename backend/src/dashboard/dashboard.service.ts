import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleStatus, DriverStatus, TripStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const [
      activeVehicles,
      availableVehicles,
      vehiclesInShop,
      totalVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      recentTrips
    ] = await Promise.all([
      this.prisma.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } }),
      this.prisma.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } }),
      this.prisma.vehicle.count({ where: { status: VehicleStatus.IN_SHOP } }),
      this.prisma.vehicle.count(),
      this.prisma.trip.count({ where: { status: TripStatus.DISPATCHED } }),
      this.prisma.trip.count({ where: { status: TripStatus.DRAFT } }),
      this.prisma.driver.count({ where: { status: DriverStatus.ON_TRIP } }),
      this.prisma.trip.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: { select: { registrationNumber: true, model: true } },
          driver: { select: { name: true } }
        }
      })
    ]);

    const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
    const retiredVehicles = totalVehicles - (activeVehicles + availableVehicles + vehiclesInShop);

    return {
      metrics: {
        activeVehicles,
        availableVehicles,
        vehiclesInShop,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        fleetUtilization,
        totalVehicles,
        retiredVehicles
      },
      recentTrips
    };
  }
}
