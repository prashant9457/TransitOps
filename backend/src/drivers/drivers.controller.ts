import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @Roles('ADMIN', 'FLEET_MANAGER')
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get('my-profile')
  @Roles('DRIVER')
  getMyProfile(@Request() req: any) {
    return this.driversService.findByName(req.user.name);
  }

  @Patch('my-profile')
  @Roles('DRIVER')
  updateMyProfile(@Request() req: any, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.updateByName(req.user.name, updateDriverDto);
  }

  @Patch('my-profile/status')
  @Roles('DRIVER')
  toggleMyStatus(@Request() req: any, @Body() body: { status: 'AVAILABLE' | 'OFF_DUTY' }) {
    return this.driversService.updateByName(req.user.name, { status: body.status } as any);
  }

  @Get()
  @Roles('ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER')
  findAll() {
    return this.driversService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
