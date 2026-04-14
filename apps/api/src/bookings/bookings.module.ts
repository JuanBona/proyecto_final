import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OutboxWorker } from '../events/outbox.worker';
import { PrismaModule } from '../prisma/prisma.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { MockProviderClient } from './mock-provider.client';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [BookingsController],
  providers: [MockProviderClient, BookingsService, OutboxWorker],
})
export class BookingsModule {}
