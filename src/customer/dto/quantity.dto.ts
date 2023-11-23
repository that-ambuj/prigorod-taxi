import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

export class Quantity {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  quantity: number = 1;
}
