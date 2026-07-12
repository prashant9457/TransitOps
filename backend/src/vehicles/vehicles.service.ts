import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async create(createVehicleDto: CreateVehicleDto) {
    const existing = await this.prisma.vehicle.findUnique({
      where: { registrationNumber: createVehicleDto.registrationNumber }
    });
    
    if (existing) {
      throw new ConflictException('Vehicle with this registration number already exists');
    }

    return this.prisma.vehicle.create({
      data: createVehicleDto
    });
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    await this.findOne(id); // Check existence

    if (updateVehicleDto.registrationNumber) {
      const existing = await this.prisma.vehicle.findUnique({
        where: { registrationNumber: updateVehicleDto.registrationNumber }
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Another vehicle with this registration number already exists');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    
    // Check if vehicle has active trips before deleting
    const activeTrips = await this.prisma.trip.count({
      where: { vehicleId: id, status: { in: ['DRAFT', 'DISPATCHED'] } }
    });

    if (activeTrips > 0) {
      throw new BadRequestException('Cannot delete vehicle with active trips');
    }

    return this.prisma.vehicle.delete({
      where: { id }
    });
  }
}
