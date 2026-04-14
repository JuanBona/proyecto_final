import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTripDto, TripsService } from './trips.service';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @Roles('traveler')
  create(@Req() req: AuthenticatedRequest, @Body() body: CreateTripDto) {
    return this.tripsService.create(req.user.sub, body);
  }

  @Post(':id/submit')
  @Roles('traveler')
  submit(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tripsService.submit(req.user.sub, id);
  }

  @Get()
  @Roles('traveler', 'approver')
  findAll(@Req() req: AuthenticatedRequest) {
    return this.tripsService.findAll(req.user.sub, req.user.role);
  }

  @Get(':id')
  @Roles('traveler', 'approver')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tripsService.findOne(req.user.sub, req.user.role, id);
  }

  @Post(':id/approve')
  @Roles('approver')
  approve(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { comment?: string },
  ) {
    return this.tripsService.approve(req.user.sub, id, body.comment);
  }

  @Post(':id/reject')
  @Roles('approver')
  reject(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { comment?: string },
  ) {
    return this.tripsService.reject(req.user.sub, id, body.comment);
  }
}
