import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role, VehicleStatus, DriverStatus, TripStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  console.log('Initializing seed application context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  // 1. Users
  const usersToSeed = [
    { name: 'Admin User', email: 'admin@transitops.com', password: 'Password123!', role: Role.ADMIN },
    { name: 'Fleet Manager', email: 'fleet@transitops.com', password: 'Password123!', role: Role.FLEET_MANAGER },
    { name: 'Driver One', email: 'driver@transitops.com', password: 'Password123!', role: Role.DRIVER },
    { name: 'Safety Officer', email: 'safety@transitops.com', password: 'Password123!', role: Role.SAFETY_OFFICER },
    { name: 'Finance Pro', email: 'finance@transitops.com', password: 'Password123!', role: Role.FINANCIAL_ANALYST },
  ];

  for (const u of usersToSeed) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exists) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await prisma.user.create({ data: { name: u.name, email: u.email, password: hashedPassword, role: u.role } });
    }
  }

  // 2. Vehicles
  const vehiclesCount = await prisma.vehicle.count();
  if (vehiclesCount === 0) {
    await prisma.vehicle.createMany({
      data: [
        { registrationNumber: 'CA-1001', model: 'Volvo FH16', type: 'Heavy Truck', capacity: 25000, odometer: 15000, acquisitionCost: 120000, status: VehicleStatus.AVAILABLE },
        { registrationNumber: 'CA-2042', model: 'Mercedes-Benz Actros', type: 'Heavy Truck', capacity: 30000, odometer: 45000, acquisitionCost: 140000, status: VehicleStatus.ON_TRIP },
        { registrationNumber: 'NY-5509', model: 'Ford Transit', type: 'Van', capacity: 3500, odometer: 5000, acquisitionCost: 45000, status: VehicleStatus.AVAILABLE },
        { registrationNumber: 'TX-9988', model: 'Scania R-Series', type: 'Heavy Truck', capacity: 28000, odometer: 120000, acquisitionCost: 110000, status: VehicleStatus.IN_SHOP },
      ]
    });
    console.log('Seeded Vehicles');
  }

  // 3. Drivers
  const driversCount = await prisma.driver.count();
  if (driversCount === 0) {
    await prisma.driver.createMany({
      data: [
        { name: 'John Doe', licenseNumber: 'DL-12345', licenseCategory: 'Class A', licenseExpiry: new Date('2028-12-31'), contactNumber: '555-0101', safetyScore: 98, status: DriverStatus.AVAILABLE },
        { name: 'Jane Smith', licenseNumber: 'DL-98765', licenseCategory: 'Class A', licenseExpiry: new Date('2027-06-15'), contactNumber: '555-0202', safetyScore: 100, status: DriverStatus.ON_TRIP },
        { name: 'Mike Johnson', licenseNumber: 'DL-55555', licenseCategory: 'Class B', licenseExpiry: new Date('2026-03-20'), contactNumber: '555-0303', safetyScore: 85, status: DriverStatus.OFF_DUTY },
      ]
    });
    console.log('Seeded Drivers');
  }

  // 4. Trips
  const tripsCount = await prisma.trip.count();
  if (tripsCount === 0) {
    const v = await prisma.vehicle.findFirst({ where: { status: VehicleStatus.ON_TRIP } });
    const d = await prisma.driver.findFirst({ where: { status: DriverStatus.ON_TRIP } });
    if (v && d) {
      await prisma.trip.create({
        data: {
          vehicleId: v.id,
          driverId: d.id,
          source: 'Los Angeles, CA',
          destination: 'Las Vegas, NV',
          cargoWeight: 15000,
          plannedDistance: 270,
          status: TripStatus.IN_PROGRESS,
        }
      });
    }

    const v2 = await prisma.vehicle.findFirst({ where: { status: VehicleStatus.AVAILABLE } });
    const d2 = await prisma.driver.findFirst({ where: { status: DriverStatus.AVAILABLE } });
    if (v2 && d2) {
      await prisma.trip.create({
        data: {
          vehicleId: v2.id,
          driverId: d2.id,
          source: 'Seattle, WA',
          destination: 'Portland, OR',
          cargoWeight: 5000,
          plannedDistance: 175,
          status: TripStatus.DRAFT,
        }
      });
    }
    
    // Add one where cargo exceeds to test validation
    const v3 = await prisma.vehicle.findFirst({ where: { status: VehicleStatus.AVAILABLE } });
    const d3 = await prisma.driver.findFirst({ where: { status: DriverStatus.AVAILABLE } });
    if (v3 && d3) {
      await prisma.trip.create({
        data: {
          vehicleId: v3.id,
          driverId: d3.id,
          source: 'Austin, TX',
          destination: 'Dallas, TX',
          cargoWeight: 999999, // Will fail Rule 4 when dispatched
          plannedDistance: 195,
          status: TripStatus.DRAFT,
        }
      });
    }
    console.log('Seeded Trips');
  }

  await app.close();
  console.log('Seed completed!');
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
