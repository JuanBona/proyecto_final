import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TripIdParamDto } from '../trips/dto/trip-id-param.dto';
import { BookingsService } from './bookings.service';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

class ConfirmBookingDto {
  @IsString()
  @IsNotEmpty()
  optionId!: string;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get(':id/options')
  @Roles('traveler', 'approver')
  getOptions(@Param() params: TripIdParamDto) {
    return this.bookingsService.getOptions(params.id);
  }

  @Post(':id/confirm')
  @Roles('approver')
  confirm(
    @Req() req: AuthenticatedRequest,
    @Param() params: TripIdParamDto,
    @Body() body: ConfirmBookingDto,
  ) {
    return this.bookingsService.confirmBooking(req.user.sub, params.id, body.optionId);
  }
}
