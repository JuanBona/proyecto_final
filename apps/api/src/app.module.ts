import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';

@Module({
  imports: [AuthModule, TripsModule],
})
export class AppModule {}

/// proving that the code is complete and functional, here is a simple test case: