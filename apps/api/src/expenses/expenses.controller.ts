import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ExpensesService } from './expenses.service';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

class TripIdParamDto {
  @IsString()
  @IsNotEmpty()
  tripId!: string;
}

class SubmitExpenseDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post(':tripId')
  @Roles('traveler')
  submit(
    @Req() req: AuthenticatedRequest,
    @Param() params: TripIdParamDto,
    @Body() body: SubmitExpenseDto,
  ) {
    return this.expensesService.submitExpense(req.user.sub, params.tripId, body);
  }
}
