import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fuel')
@UseGuards(JwtAuthGuard)
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get()
  findAll() {
    return this.fuelService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.fuelService.create(data);
  }
}
