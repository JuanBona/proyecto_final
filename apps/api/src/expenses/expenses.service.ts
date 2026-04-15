import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

interface SubmitExpenseInput {
  amount: number;
  category: string;
  description?: string;
}

const maxByCategory: Record<string, number> = {
  hotel: 300,
  meal: 80,
  taxi: 60,
};

const allowedTripStatuses = new Set(['booked', 'in_trip', 'expense_review']);

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async submitExpense(travelerId: string, tripId: string, input: SubmitExpenseInput) {
    const trip = await this.findTripOrFail(tripId);

    if (trip.travelerId !== travelerId) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Access denied', statusCode: 403 },
        HttpStatus.FORBIDDEN,
      );
    }

    if (!allowedTripStatuses.has(trip.status)) {
      throw new HttpException(
        {
          code: 'INVALID_STATUS',
          message: 'Expenses can only be submitted when trip is booked, in_trip, or expense_review',
          statusCode: 409,
        },
        HttpStatus.CONFLICT,
      );
    }

    const normalizedCategory = input.category.trim().toLowerCase();
    const cap = maxByCategory[normalizedCategory];
    const status = cap !== undefined && input.amount > cap ? 'flagged' : 'submitted';

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          tripRequestId: tripId,
          submittedById: travelerId,
          amount: input.amount,
          category: input.category.trim(),
          description: input.description?.trim() || null,
          status,
        },
      });

      await this.auditService.logWithClient(tx as Prisma.TransactionClient, {
        action: 'EXPENSE_SUBMITTED',
        actor: travelerId,
        entity: 'Expense',
        entityId: expense.id,
        metadata: {
          tripId,
          status,
          category: input.category.trim(),
          amount: input.amount,
        },
      });

      return expense;
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
