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
      where: { driverId: id, status: { in: ['DRAFT', 'DISPATCHED'] } }
    });

    if (activeTrips > 0) {
      throw new BadRequestException('Cannot delete driver with active trips');
    }

    return this.prisma.driver.delete({
      where: { id }
    });
  }
}
