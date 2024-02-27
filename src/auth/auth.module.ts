import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { OtpService } from "@app/otp.service";
import { AuthService } from "./auth.service";
import { WhatsappService } from "@app/whatsapp.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [AuthService, OtpService, WhatsappService, ConfigService],
})
export class AuthModule {}
