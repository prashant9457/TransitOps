import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @Roles('ADMIN', 'FLEET_MANAGER')
  findAll() {
    return this.tripsService.findAll();
  }

  @Post(':id/dispatch')
  @Roles('ADMIN', 'FLEET_MANAGER')
  dispatchTrip(@Param('id') id: string) {
    return this.tripsService.dispatchTrip(id);
  }

  @Post(':id/complete')
  @Roles('ADMIN', 'FLEET_MANAGER', 'DRIVER')
  completeTrip(@Param('id') id: string, @Body('finalDistance') finalDistance?: number) {
    return this.tripsService.completeTrip(id, finalDistance);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'FLEET_MANAGER')
  cancelTrip(@Param('id') id: string) {
    return this.tripsService.cancelTrip(id);
  }
}
