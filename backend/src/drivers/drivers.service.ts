import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.driver.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async findByName(name: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      include: {
        trips: {
          select: { id: true, status: true },
        },
      },
    });
    if (!driver) throw new NotFoundException(`No driver profile found for "${name}"`);

    const totalTrips = driver.trips.length;
    const completedTrips = driver.trips.filter(t => t.status === 'COMPLETED').length;
    const activeTrips = driver.trips.filter(t => ['ASSIGNED', 'READY_TO_START', 'IN_PROGRESS'].includes(t.status)).length;
    const cancelledTrips = driver.trips.filter(t => t.status === 'CANCELLED').length;

    const { trips, ...profile } = driver;
    return { ...profile, totalTrips, completedTrips, activeTrips, cancelledTrips };
  }

  async updateByName(name: string, updateDriverDto: UpdateDriverDto) {
    const driver = await this.prisma.driver.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!driver) throw new NotFoundException(`No driver profile found for "${name}"`);
    return this.update(driver.id, updateDriverDto);
  }

  async create(createDriverDto: CreateDriverDto) {
    const existing = await this.prisma.driver.findUnique({
      where: { licenseNumber: createDriverDto.licenseNumber }
    });
    
    if (existing) {
      throw new ConflictException('Driver with this license number already exists');
    }

    return this.prisma.driver.create({
      data: {
        ...createDriverDto,
        licenseExpiry: new Date(createDriverDto.licenseExpiry)
      }
    });
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    await this.findOne(id);

    if (updateDriverDto.licenseNumber) {
      const existing = await this.prisma.driver.findUnique({
        where: { licenseNumber: updateDriverDto.licenseNumber }
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Another driver with this license number already exists');
      }
    }

    const dataToUpdate: any = { ...updateDriverDto };
    if (updateDriverDto.licenseExpiry) {
      dataToUpdate.licenseExpiry = new Date(updateDriverDto.licenseExpiry);
    }

    return this.prisma.driver.update({
      where: { id },
      data: dataToUpdate
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    
    const activeTrips = await this.prisma.trip.count({
      where: { driverId: id, status: { in: ['ASSIGNED', 'READY_TO_START', 'IN_PROGRESS'] } }
    });

    if (activeTrips > 0) {
      throw new BadRequestException('Cannot delete driver with active trips');
    }

    return this.prisma.driver.delete({
      where: { id }
    });
  }
}
