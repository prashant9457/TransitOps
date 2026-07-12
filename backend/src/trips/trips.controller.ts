import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
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

  @Get('my-trips')
  @Roles('DRIVER')
  getMyTrips(@Request() req: any) {
    // req.user is set by JwtAuthGuard
    return this.tripsService.getMyTrips(req.user);
  }

  @Post()
  @Roles('ADMIN', 'FLEET_MANAGER')
  createTrip(@Body() data: any) {
    return this.tripsService.createTrip(data);
  }

  @Post(':id/dispatch')
  @Roles('ADMIN', 'FLEET_MANAGER')
  dispatchTrip(@Param('id') id: string) {
    return this.tripsService.dispatchTrip(id);
  }

  @Post(':id/start')
  @Roles('ADMIN', 'FLEET_MANAGER', 'DRIVER')
  startTrip(@Param('id') id: string, @Request() req: any) {
    return this.tripsService.startTrip(id, req.user);
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

  @Post(':id/claim')
  @Roles('DRIVER')
  claimTrip(@Param('id') id: string, @Request() req: any) {
    return this.tripsService.claimOpenTrip(id, req.user);
  }

  @Post(':id/log')
  @Roles('ADMIN', 'FLEET_MANAGER', 'DRIVER')
  logTrip(@Param('id') id: string, @Body() data: any) {
    return this.tripsService.logTripData(id, data);
  }
}
