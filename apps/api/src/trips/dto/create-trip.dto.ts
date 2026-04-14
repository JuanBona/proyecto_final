import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsNumber()
  budget!: number;

  @IsString()
  @IsNotEmpty()
  costCenter!: string;
}
