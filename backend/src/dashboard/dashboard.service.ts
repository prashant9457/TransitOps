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
      this.prisma.trip.count({ where: { status: TripStatus.IN_PROGRESS } }),
      this.prisma.trip.count({ where: { status: TripStatus.ASSIGNED } }),
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

  async getMyMetrics(user: any) {
    if (user.role !== 'DRIVER') {
      return this.getMetrics();
    }
    
    const driver = await this.prisma.driver.findFirst({
      where: { name: user.name }
    });

    if (!driver) return { metrics: {}, recentTrips: [] };

    const myTrips = await this.prisma.trip.findMany({
      where: { driverId: driver.id },
      include: {
        vehicle: true,
        expenses: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const assignedTrips = myTrips.filter(t => t.status === 'ASSIGNED' || t.status === 'READY_TO_START' || t.status === 'IN_PROGRESS').length;
    const completedTrips = myTrips.filter(t => t.status === 'COMPLETED').length;
    
    // Total travelled distance from completed trips (assuming actualEndTime exists or just plannedDistance)
    const totalTravelledDistance = myTrips
      .filter(t => t.status === 'COMPLETED')
      .reduce((acc, curr) => acc + (curr.plannedDistance || 0), 0);

    const totalCosts = myTrips.reduce((acc, trip) => {
      const expenses = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      return acc + expenses;
    }, 0);

    return {
      metrics: {
        assignedTrips,
        completedTrips,
        totalTravelledDistance,
        totalCosts
      },
      recentTrips: myTrips.slice(0, 5)
    };
  }
}
