import { IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateTripDto {
  @IsNotEmpty()
  from_city: string;

  @IsOptional()
  from_village?: string;

  @IsNotEmpty()
  to_city: string;

  @IsOptional()
  to_village?: string;

  @IsInt()
  @Type(() => Number)
  seat_price: number;

  @IsInt()
  @Type(() => Number)
  total_seats: number;

  @IsOptional()
  comment?: string;
}
