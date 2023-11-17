import { IsNumberString } from "class-validator";

export class VerificationDto {
  @IsNumberString()
  otp: string;
}
