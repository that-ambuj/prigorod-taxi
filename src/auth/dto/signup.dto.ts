import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber } from "class-validator";

enum UserType {
  Customer = "CUSTOMER",
  Driver = "DRIVER",
}

export class SignUpDto {
  /**
   * @example "+7 9876543219"
   */
  @IsPhoneNumber("KZ")
  @IsNotEmpty()
  phone_number: string;

  /**
   * @example "John Doe"
   */
  @IsOptional()
  name?: string;

  city: string;
  village: string;

  @ApiProperty({ enum: UserType, isArray: false })
  @IsEnum(UserType)
  user_type: UserType;
}
