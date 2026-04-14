import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(travelerId: string, dto: CreateTripDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new HttpException(
        {
          code: 'VALIDATION_ERROR',
          message: 'startDate and endDate must be valid ISO date strings',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (endDate <= startDate) {
      throw new HttpException(
        {
          code: 'VALIDATION_ERROR',
          message: 'endDate must be after startDate',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.tripRequest.create({
      data: {
        travelerId,
        destination: dto.destination,
        startDate,
        endDate,
        reason: dto.reason,
        budget: dto.budget,
        costCenter: dto.costCenter,
        status: 'draft',
      },
    });
  }

  async submit(travelerId: string, tripId: string) {
    const trip = await this.findTripOrFail(tripId);

    if (trip.travelerId !== travelerId) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Access denied', statusCode: 403 },
        HttpStatus.FORBIDDEN,
      );
    }

    if (trip.status !== 'draft') {
      throw new HttpException(
        { code: 'INVALID_STATUS', message: 'Trip is not in draft status', statusCode: 409 },
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.tripRequest.update({
      where: { id: tripId },
      data: { status: 'pending_approval' },
    });
  }

  async findAll(userId: string, role: string) {
    if (role === 'approver') {
      return this.prisma.tripRequest.findMany({
        where: { status: 'pending_approval' },
        include: { approval: true },
      });
    }

    return this.prisma.tripRequest.findMany({
      where: { travelerId: userId },
      include: { approval: true },
    });
  }

  async findOne(userId: string, role: string, tripId: string) {
    const trip = await this.findTripOrFail(tripId);

    if (role === 'approver' && trip.status !== 'pending_approval') {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Access denied', statusCode: 403 },
        HttpStatus.FORBIDDEN,
      );
    }

    if (role !== 'approver' && trip.travelerId !== userId) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Access denied', statusCode: 403 },
        HttpStatus.FORBIDDEN,
      );
    }

    return trip;
  }

  async approve(approverId: string, tripId: string, comment?: string) {
    return this.resolveTrip(approverId, tripId, 'approved', comment);
  }

  async reject(approverId: string, tripId: string, comment?: string) {
    return this.resolveTrip(approverId, tripId, 'rejected', comment);
  }

  private async resolveTrip(
    approverId: string,
    tripId: string,
    decision: 'approved' | 'rejected',
    comment?: string,
  ) {
    const trip = await this.findTripOrFail(tripId);

    if (trip.travelerId === approverId) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Approver cannot review own trip', statusCode: 403 },
        HttpStatus.FORBIDDEN,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.tripRequest.updateMany({
        where: { id: tripId, status: 'pending_approval' },
        data: { status: decision },
      });

      if (updated.count === 0) {
        throw new HttpException(
          { code: 'INVALID_STATUS', message: 'Trip is not pending approval', statusCode: 409 },
          HttpStatus.CONFLICT,
        );
      }

      await tx.approval.create({
        data: { tripRequestId: tripId, approverId, decision, comment },
      });

      return tx.tripRequest.findUniqueOrThrow({
        where: { id: tripId },
        include: { approval: true },
      });
    });
  }

  private async findTripOrFail(tripId: string) {
    const trip = await this.prisma.tripRequest.findUnique({
      where: { id: tripId },
      include: { approval: true },
    });

    if (!trip) {
      throw new HttpException(
        { code: 'TRIP_NOT_FOUND', message: 'Trip request not found', statusCode: 404 },
        HttpStatus.NOT_FOUND,
      );
    }

    return trip;
  }
}
