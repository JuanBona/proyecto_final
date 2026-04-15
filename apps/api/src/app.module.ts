import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { ExpensesModule } from './expenses/expenses.module';
import { TripsModule } from './trips/trips.module';

@Module({
  imports: [AuthModule, TripsModule, BookingsModule, ExpensesModule],
})
export class AppModule {}
