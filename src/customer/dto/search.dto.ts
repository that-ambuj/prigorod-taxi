import { Type } from "class-transformer";
import { IsBoolean } from "class-validator";

export class SearchDto {
  search_from?: string;
  search_to?: string;

  @IsBoolean()
  @Type(() => Boolean)
  show_filled?: boolean = false;
}
