import { IsISO8601, IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateTripDto {
  @IsNotEmpty()
  from: string;

  @IsNotEmpty()
  to: string;

  @IsInt()
  @Type(() => Number)
  seat_price: number;

  @IsInt()
  @Type(() => Number)
  total_seats: number;

  @IsISO8601()
  departure_time: Date;

  @IsOptional()
  comment?: string;
}
