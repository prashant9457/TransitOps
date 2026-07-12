import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.trip.findMany({
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async dispatchTrip(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true }
      });

      if (!trip) throw new NotFoundException('Trip not found');
      if (trip.status !== TripStatus.DRAFT) throw new BadRequestException('Only DRAFT trips can be dispatched');

      // Rule 1, 8, 9: Vehicle status must be AVAILABLE
      if (trip.vehicle.status !== VehicleStatus.AVAILABLE) {
        throw new BadRequestException(`Vehicle is currently ${trip.vehicle.status} and cannot be dispatched`);
      }

      // Rule 2: Driver status must be AVAILABLE
      if (trip.driver.status !== DriverStatus.AVAILABLE) {
        throw new BadRequestException(`Driver is currently ${trip.driver.status} and cannot be dispatched`);
      }

      // Rule 3: Driver license must not be expired
      const now = new Date();
      if (new Date(trip.driver.licenseExpiry) < now) {
        throw new BadRequestException('Driver license is expired');
      }

      // Rule 4: Cargo Weight cannot exceed vehicle capacity
      if (trip.cargoWeight > trip.vehicle.capacity) {
        throw new BadRequestException('Cargo weight exceeds vehicle capacity');
      }

      // Rule 5: Dispatching changes Vehicle & Driver to ON_TRIP, Trip to DISPATCHED
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.ON_TRIP }
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.ON_TRIP }
      });

      return tx.trip.update({
        where: { id },
        data: { status: TripStatus.DISPATCHED },
        include: { vehicle: true, driver: true }
      });
    });
  }

  async completeTrip(id: string, finalDistance?: number) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true }
      });

      if (!trip) throw new NotFoundException('Trip not found');
      if (trip.status !== TripStatus.DISPATCHED) throw new BadRequestException('Only DISPATCHED trips can be completed');

      const distanceToAdd = finalDistance ?? trip.plannedDistance;

      // Rule 6: Updates vehicle odometer, changes Vehicle & Driver to AVAILABLE
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { 
          status: VehicleStatus.AVAILABLE,
          odometer: trip.vehicle.odometer + distanceToAdd
        }
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE }
      });

      return tx.trip.update({
        where: { id },
        data: { status: TripStatus.COMPLETED },
        include: { vehicle: true, driver: true }
      });
    });
  }

  async cancelTrip(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id } });

      if (!trip) throw new NotFoundException('Trip not found');
      if (trip.status === TripStatus.COMPLETED) throw new BadRequestException('Cannot cancel a completed trip');

      if (trip.status === TripStatus.DISPATCHED) {
        // Rule 7: Cancelling restores Vehicle & Driver to AVAILABLE
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.AVAILABLE }
        });

        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.AVAILABLE }
        });
      }

      return tx.trip.update({
        where: { id },
        data: { status: TripStatus.CANCELLED },
        include: { vehicle: true, driver: true }
      });
    });
  }
}
