import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockBookingOption, MockProviderClient } from './mock-provider.client';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockProviderClient: MockProviderClient,
  ) {}

  async getOptions(userId: string, role: string, tripId: string): Promise<MockBookingOption[]> {
    const trip = await this.findTripOrFail(tripId);

    if (role !== 'approver' && trip.travelerId !== userId) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Access denied', statusCode: 403 },
        HttpStatus.FORBIDDEN,
      );
    }

    return this.mockProviderClient.getOptionsForTrip({ id: trip.id, budget: trip.budget });
  }

  async confirmBooking(approverId: string, tripId: string, optionId: string) {
    const trip = await this.findTripOrFail(tripId);

    if (trip.status !== 'approved') {
      throw new HttpException(
        { code: 'INVALID_STATUS', message: 'Trip is not approved', statusCode: 409 },
        HttpStatus.CONFLICT,
      );
    }

    const option = this.mockProviderClient
      .getOptionsForTrip({ id: trip.id, budget: trip.budget })
      .find((candidate) => candidate.id === optionId);

    if (!option) {
      throw new HttpException(
        { code: 'OPTION_NOT_FOUND', message: 'Booking option not found', statusCode: 404 },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const tripUpdate = await tx.tripRequest.updateMany({
        where: { id: tripId, status: 'approved' },
        data: { status: 'booked' },
      });

      if (tripUpdate.count === 0) {
        throw new HttpException(
          { code: 'INVALID_STATUS', message: 'Trip is not approved', statusCode: 409 },
          HttpStatus.CONFLICT,
        );
      }

      const booking = await tx.booking.create({
        data: {
          tripRequestId: tripId,
          provider: option.provider,
          offerId: option.id,
          currency: 'USD',
          totalPrice: option.total,
          snapshot: JSON.stringify(option),
          status: 'booked',
        },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: 'TripRequest',
          aggregateId: tripId,
          eventType: 'BookingConfirmed',
          payload: JSON.stringify({
            tripId,
            bookingId: booking.id,
            optionId: option.id,
            provider: option.provider,
            total: option.total,
            confirmedBy: approverId,
          }),
        },
      });

      return booking;
    });
  }

  private async findTripOrFail(tripId: string) {
    const trip = await this.prisma.tripRequest.findUnique({ where: { id: tripId } });

    if (!trip) {
      throw new HttpException(
        { code: 'TRIP_NOT_FOUND', message: 'Trip request not found', statusCode: 404 },
        HttpStatus.NOT_FOUND,
      );
    }

    return trip;
  }
}
