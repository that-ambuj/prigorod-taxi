import { IsInt, IsNotEmpty, IsOptional } from "class-validator";
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

  @IsOptional()
  comment?: string;
}
