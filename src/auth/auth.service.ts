import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SignUpDto } from "./dto/signup.dto";
import { Customer, Driver } from "@prisma/client";
import { OtpService } from "@app/otp.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  async signInWithOtp(data: SignUpDto) {
    let user: Driver | Customer;

    const { user_type, phone_number } = data;

    if (user_type === "CUSTOMER") {
      user =
        (await this.prisma.customer.findUnique({ where: { phone_number } })) ??
        (await this.prisma.customer.create({ data }));
    } else {
      user =
        (await this.prisma.driver.findUnique({ where: { phone_number } })) ??
        (await this.prisma.driver.create({ data }));
    }

    return this.sendOtp(user.id, user_type);
  }

  private async sendOtp(
    user_id: string,
    user_type: "DRIVER" | "CUSTOMER",
  ): Promise<string> {
    const otp = this.otpService.generateOtp();

    if (user_type === "DRIVER") {
      await this.prisma.driverOtpToken.deleteMany({
        where: { driver_id: user_id },
      });

      // TODO: send otp via SMS service provider like AWS SNS
      const token = await this.prisma.driverOtpToken.create({
        data: {
          driver_id: user_id,
          otp,
        },
      });

      return token.otp;
    } else {
      await this.prisma.customerOtpToken.deleteMany({
        where: { customer_id: user_id },
      });

      // TODO: send otp via SMS service provider like AWS SNS
      const token = await this.prisma.customerOtpToken.create({
        data: {
          customer_id: user_id,
          otp,
        },
      });

      return token.otp;
    }
  }

  async verifyOtp(otp: string): Promise<Driver | Customer> {
    const user =
      (await this.findCustomerByOtp(otp)) ?? (await this.findDriverByOtp(otp));

    if (!user) {
      throw new NotFoundException("Invalid OTP", { cause: "User not found" });
    }

    return user;
  }

  private async findCustomerByOtp(otp: string) {
    const token = await this.prisma.customerOtpToken.findFirst({
      where: { otp },
      orderBy: { created_at: "desc" },
    });

    if (!token) {
      return null;
    }

    return this.prisma.customer.findUnique({
      where: { id: token.customer_id },
    });
  }

  private async findDriverByOtp(otp: string) {
    const token = await this.prisma.driverOtpToken.findFirst({
      where: { otp },
      orderBy: { created_at: "desc" },
    });

    if (!token) {
      return null;
    }

    return this.prisma.driver.findUnique({
      where: { id: token.driver_id },
    });
  }
}
