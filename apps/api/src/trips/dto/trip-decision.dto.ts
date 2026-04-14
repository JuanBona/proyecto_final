import { IsOptional, IsString } from 'class-validator';

export class TripDecisionDto {
  @IsOptional()
  @IsString()
  comment?: string;
}
