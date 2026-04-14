import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { AUTH_SECRETS, createAuthSecrets } from './auth.constants';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [JwtModule.register({}), PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    { provide: AUTH_SECRETS, useFactory: createAuthSecrets },
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule, AUTH_SECRETS],
})
export class AuthModule {}
