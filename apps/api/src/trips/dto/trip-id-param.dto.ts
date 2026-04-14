import { IsNotEmpty, IsString } from 'class-validator';

export class TripIdParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
