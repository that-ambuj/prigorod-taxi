import { IsNotEmpty } from "class-validator";

export class DeviceTokenDto {
  /**
   * @example Device Registration Token
   */
  @IsNotEmpty()
  registration_token: string;
}
