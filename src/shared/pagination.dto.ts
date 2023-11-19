import { IsInt, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  skip(): number {
    return (this.page - 1) * this.limit;
  }
}
