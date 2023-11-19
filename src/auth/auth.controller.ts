import { Controller, Post, Body, Session } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
} from "@nestjs/swagger";
import { SignUpDto } from "./dto/signup.dto";
import { VerificationDto } from "./dto/verification.dto";
import type { Session as TSession } from "@fastify/secure-session";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sendOtp")
  @ApiCreatedResponse({ description: "An OTP is sent." })
  @ApiBadRequestResponse({ description: "Validation error" })
  async sendOtp(@Body() body: SignUpDto) {
    const otp = await this.authService.signInWithOtp(body);

    return { message: "OTP sent successfully", otp };
  }

  @Post("verifyOtp")
  async verifyOtp(
    @Session() session: TSession,
    @Body() verificationData: VerificationDto,
  ) {
    const user = await this.authService.verifyOtp(verificationData.otp);

    const is_new = !user.name;

    session.set("data", user.id);

    return { message: "OTP verified!", is_new };
  }
}
