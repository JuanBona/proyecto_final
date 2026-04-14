import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BookingsService } from './bookings.service';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

class ConfirmBookingDto {
  @IsString()
  @IsNotEmpty()
  tripId!: string;

  @IsString()
  @IsNotEmpty()
  optionId!: string;
}

class BookingOptionsParamDto {
  @IsString()
  @IsNotEmpty()
  tripId!: string;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('options/:tripId')
  @Roles('traveler', 'approver')
  getOptions(@Req() req: AuthenticatedRequest, @Param() params: BookingOptionsParamDto) {
    return this.bookingsService.getOptions(req.user.sub, req.user.role, params.tripId);
  }

  @Post('confirm')
  @Roles('approver')
  confirm(@Req() req: AuthenticatedRequest, @Body() body: ConfirmBookingDto) {
    return this.bookingsService.confirmBooking(req.user.sub, body.tripId, body.optionId);
  }
}
