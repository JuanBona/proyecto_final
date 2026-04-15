import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, AuditService],
})
export class ExpensesModule {}
