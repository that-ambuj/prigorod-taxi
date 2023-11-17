import { IsOptional } from "class-validator";

export class ProfileUpdateDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  village?: string;

  /**
   * Car's license plate number
   *
   * Noop in case of customer
   */
  @IsOptional()
  car_number?: string;

  /**
   * Car's Model Name
   *
   * Noop in case of customer
   *
   * @example "911 Turbo S"
   */
  @IsOptional()
  car_model?: string;

  /**
   * Car's Brand
   *
   * Noop in case of customer
   *
   * @example Porsche
   */
  @IsOptional()
  car_brand?: string;

  /**
   * Car's Color
   *
   * Noop in case of customer
   *
   * @example Red
   */
  @IsOptional()
  car_color?: string;
}
