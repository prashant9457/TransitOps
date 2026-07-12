import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
        expenses: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMyTrips(user: any) {
    // user has email, id, name, role
    if (user.role !== 'DRIVER') {
      throw new ForbiddenException('Only drivers can access my-trips');
    }

    const driver = await this.prisma.driver.findFirst({
      where: { name: user.name }
    });

    if (!driver) return [];

    return this.prisma.trip.findMany({
      where: {
        OR: [
          { driverId: driver.id },
          { isOpenToAll: true, status: 'ASSIGNED' }
        ]
      },
      include: {
        vehicle: true,
        driver: true,
        expenses: true,
      },
      orderBy: { scheduledStartTime: 'asc' }
    });
  }

  async createTrip(data: any) {
    return this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw new NotFoundException('Vehicle not found');
      
      if (!data.isOpenToAll) {
        const driver = await tx.driver.findUnique({ where: { id: data.driverId } });
        if (!driver) throw new NotFoundException('Driver not found');
        if (driver.status !== DriverStatus.AVAILABLE) {
          throw new BadRequestException(`Driver is currently ${driver.status} and cannot be assigned`);
        }
      }

      if (vehicle.status !== VehicleStatus.AVAILABLE) {
        throw new BadRequestException(`Vehicle is currently ${vehicle.status} and cannot be assigned`);
      }
      // Relaxing expiry check for hackathon dummy data
      // if (new Date(driver.licenseExpiry) < new Date()) {
      //   throw new BadRequestException('Driver license is expired');
      // }
      if (data.cargoWeight > vehicle.capacity) {
        throw new BadRequestException('Cargo weight exceeds vehicle capacity');
      }

      const trip = await tx.trip.create({
        data: {
          source: data.source,
          destination: data.destination,
          vehicleId: data.vehicleId,
          driverId: data.isOpenToAll ? null : data.driverId,
          isOpenToAll: !!data.isOpenToAll,
          cargoWeight: data.cargoWeight,
          plannedDistance: data.plannedDistance,
          scheduledStartTime: data.scheduledStartTime ? new Date(data.scheduledStartTime) : null,
          scheduledEndTime: data.scheduledEndTime ? new Date(data.scheduledEndTime) : null,
          status: TripStatus.ASSIGNED // Initial state when assigned to driver
        },
        include: { vehicle: true, driver: true }
      });

      return trip;
    });
  }

  async dispatchTrip(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true }
      });

      if (!trip) throw new NotFoundException('Trip not found');
      if (trip.status !== TripStatus.ASSIGNED && trip.status !== TripStatus.DRAFT) {
        throw new BadRequestException('Only ASSIGNED or DRAFT trips can be dispatched');
      }
      if (!trip.driver || !trip.driverId) {
        throw new BadRequestException('Trip must be assigned to a driver before it can be dispatched');
      }

      if (trip.vehicle.status !== VehicleStatus.AVAILABLE) {
        throw new BadRequestException(`Vehicle is currently ${trip.vehicle.status} and cannot be dispatched`);
      }
      if (trip.driver.status !== DriverStatus.AVAILABLE) {
        throw new BadRequestException(`Driver is currently ${trip.driver.status} and cannot be dispatched`);
      }

      // Lock them in
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
        data: { status: TripStatus.READY_TO_START },
        include: { vehicle: true, driver: true }
      });
    });
  }

  async startTrip(id: string, user: any) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { driver: true }
      });

      if (!trip) throw new NotFoundException('Trip not found');
      if (trip.status !== TripStatus.READY_TO_START) {
        throw new BadRequestException('Only READY_TO_START trips can be started');
      }
      if (!trip.driver) {
        throw new BadRequestException('Trip is missing a driver');
      }

      // If requested by a driver, ensure it's their trip
      if (user.role === 'DRIVER' && trip.driver.name !== user.name) {
        throw new ForbiddenException('You can only start your own trips');
      }

      return tx.trip.update({
        where: { id },
        data: { 
          status: TripStatus.IN_PROGRESS,
          actualStartTime: new Date()
        },
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
      if (trip.status !== TripStatus.IN_PROGRESS && trip.status !== TripStatus.READY_TO_START) {
        throw new BadRequestException('Trip must be IN_PROGRESS or READY_TO_START to be completed');
      }

      const distanceToAdd = finalDistance ?? trip.plannedDistance;

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { 
          status: VehicleStatus.AVAILABLE,
          odometer: trip.vehicle.odometer + distanceToAdd
        }
      });

      if (trip.driverId) {
        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.AVAILABLE }
        });
      }

      return tx.trip.update({
        where: { id },
        data: { 
          status: TripStatus.COMPLETED,
          actualEndTime: new Date()
        },
        include: { vehicle: true, driver: true }
      });
    });
  }

  async cancelTrip(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id } });

      if (!trip) throw new NotFoundException('Trip not found');
      if (trip.status === TripStatus.COMPLETED) throw new BadRequestException('Cannot cancel a completed trip');

      // Free up driver and vehicle if they were locked
      if (trip.status === TripStatus.READY_TO_START || trip.status === TripStatus.IN_PROGRESS) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.AVAILABLE }
        });

        if (trip.driverId) {
          await tx.driver.update({
            where: { id: trip.driverId },
            data: { status: DriverStatus.AVAILABLE }
          });
        }
      }

      return tx.trip.update({
        where: { id },
        data: { status: TripStatus.CANCELLED },
        include: { vehicle: true, driver: true }
      });
    });
  }

  async claimOpenTrip(id: string, user: any) {
    return this.prisma.$transaction(async (tx) => {
      if (user.role !== 'DRIVER') throw new ForbiddenException('Only drivers can claim open trips');
      const trip = await tx.trip.findUnique({ where: { id } });
      if (!trip || !trip.isOpenToAll || trip.status !== 'ASSIGNED') {
        throw new BadRequestException('This trip is not available to claim');
      }

      const driver = await tx.driver.findFirst({ where: { name: user.name } });
      if (!driver) throw new NotFoundException('Driver profile not found');
      if (driver.status !== DriverStatus.AVAILABLE) {
        throw new BadRequestException('You must be AVAILABLE to claim a trip');
      }

      return tx.trip.update({
        where: { id },
        data: {
          driverId: driver.id,
          isOpenToAll: false,
          driverAcceptedAt: new Date()
        },
        include: { vehicle: true, driver: true }
      });
    });
  }

  async acceptTrip(id: string, user: any) {
    return this.prisma.$transaction(async (tx) => {
      if (user.role !== 'DRIVER') throw new ForbiddenException('Only drivers can accept trips');
      const trip = await tx.trip.findUnique({ where: { id }, include: { driver: true } });
      if (!trip) throw new NotFoundException('Trip not found');
      if (trip.driver?.name !== user.name) throw new ForbiddenException('This trip is not assigned to you');
      if (trip.status !== 'ASSIGNED') throw new BadRequestException('Trip is not in ASSIGNED state');
      if (trip.driverAcceptedAt) throw new BadRequestException('Trip already accepted');

      return tx.trip.update({
        where: { id },
        data: { driverAcceptedAt: new Date() },
        include: { vehicle: true, driver: true }
      });
    });
  }

  async addMidTripExpense(id: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id } });
      if (!trip) throw new NotFoundException('Trip not found');
      
      if (data.fuelLiters && data.fuelCost) {
        await tx.fuelLog.create({
          data: {
            vehicleId: trip.vehicleId,
            liters: Number(data.fuelLiters),
            cost: Number(data.fuelCost),
            odometer: trip.plannedDistance // Just a placeholder, as we don't know exact odometer mid-trip unless provided
          }
        });
      }

      if (data.miscCost > 0) {
        await tx.expense.create({
          data: {
            vehicleId: trip.vehicleId,
            tripId: trip.id,
            type: data.expenseType || 'MISC',
            amount: Number(data.miscCost),
            description: data.description || 'Mid-trip expense'
          }
        });
      }

      return trip;
    });
  }

  async logTripData(id: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id } });
      if (!trip) throw new NotFoundException('Trip not found');
      if (trip.status !== TripStatus.COMPLETED) throw new BadRequestException('Trip must be completed to log reports');
      if (trip.reportsLogged) throw new BadRequestException('Reports already logged');

      if (data.endingOdometer) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { odometer: data.endingOdometer }
        });
      }

      if (data.fuelLiters && data.fuelCost) {
        await tx.fuelLog.create({
          data: {
            vehicleId: trip.vehicleId,
            liters: data.fuelLiters,
            cost: data.fuelCost,
            odometer: data.endingOdometer || 0
          }
        });
      }

      if (data.miscCost > 0) {
        await tx.expense.create({
          data: {
            vehicleId: trip.vehicleId,
            tripId: trip.id,
            type: 'MISC',
            amount: data.miscCost,
            description: 'Post-trip miscellaneous cost'
          }
        });
      }

      if (data.maintenanceRequired && data.maintenanceIssue) {
        await tx.maintenanceLog.create({
          data: {
            vehicleId: trip.vehicleId,
            issue: data.maintenanceIssue,
            status: 'OPEN',
          }
        });
      }

      return tx.trip.update({
        where: { id },
        data: {
          reportsLogged: true,
          maintenanceRequired: !!data.maintenanceRequired
        },
        include: { vehicle: true, driver: true }
      });
    });
  }
}
