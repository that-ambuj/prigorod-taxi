import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { OtpService } from "@app/otp.service";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, OtpService],
})
export class AuthModule {}
