import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SignUpDto } from "./dto/signup.dto";
import { Customer, Driver } from "@prisma/client";
import { OtpService } from "@app/otp.service";

type UserType = {
  user_type: "CUSTOMER" | "DRIVER";
};

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  public async signInWithOtp(data: SignUpDto) {
    let user: Driver | Customer;

    const { user_type, ...rest } = data;

    if (user_type === "CUSTOMER") {
      user =
        (await this.db.customer.findUnique({
          where: { phone_number: rest.phone_number },
        })) ?? (await this.db.customer.create({ data: rest }));
    } else {
      user =
        (await this.db.driver.findUnique({
          where: { phone_number: rest.phone_number },
        })) ?? (await this.db.driver.create({ data: rest }));
    }

    return this.sendOtp(user.id, user_type);
  }

  public async findOrCreateCustomer(data: Customer): Promise<Customer> {
    return (
      (await this.db.customer.findUnique({
        where: { phone_number: data.phone_number },
      })) ??
      (await this.db.customer.create({
        data: {
          phone_number: data.phone_number,
          device_token: data.device_token,
          name: data.name,
          city: data.city,
          village: data.village,
        },
      }))
    );
  }

  public async findOrCreateDriver(data: Customer): Promise<Driver> {
    return (
      (await this.db.driver.findUnique({
        where: { phone_number: data.phone_number },
        include: { car: true },
      })) ??
      (await this.db.driver.create({
        data: {
          phone_number: data.phone_number,
          device_token: data.device_token,
          name: data.name,
          city: data.city,
          village: data.village,
        },
        include: { car: true },
      }))
    );
  }

  private async sendOtp(
    user_id: string,
    user_type: "DRIVER" | "CUSTOMER",
  ): Promise<string> {
    const otp = this.otpService.generateOtp();

    if (user_type === "DRIVER") {
      await this.db.driverOtpToken.deleteMany({
        where: { driver_id: user_id },
      });

      // TODO: send otp via SMS service provider like AWS SNS
      const token = await this.db.driverOtpToken.create({
        data: {
          driver_id: user_id,
          otp,
        },
      });

      return token.otp;
    } else {
      await this.db.customerOtpToken.deleteMany({
        where: { customer_id: user_id },
      });

      // TODO: send otp via SMS service provider like AWS SNS
      const token = await this.db.customerOtpToken.create({
        data: {
          customer_id: user_id,
          otp,
        },
      });

      return token.otp;
    }
  }

  public async verifyOtp(otp: string): Promise<Driver | Customer> {
    const user =
      (await this.findCustomerByOtp(otp)) ?? (await this.findDriverByOtp(otp));

    if (!user) {
      throw new NotFoundException("Invalid OTP", { cause: "User not found" });
    }

    return user;
  }

  public async findUserById(
    id: string,
  ): Promise<(Driver & UserType) | (Customer & UserType) | null> {
    let user: Driver | Customer;

    user = await this.db.customer.findUnique({ where: { id } });
    if (user) {
      return { ...user, user_type: "CUSTOMER" };
    }

    user = await this.db.driver.findUnique({ where: { id } });
    if (user) {
      return { ...user, user_type: "DRIVER" };
    }

    return null;
  }

  public async setDeviceToken({
    id,
    user_type,
    device_token,
  }: {
    id: string;
    user_type: "DRIVER" | "CUSTOMER";
    device_token: string;
  }) {
    if (user_type == "CUSTOMER") {
      return this.db.customer.update({
        where: { id },
        data: { device_token },
      });
    } else {
      return this.db.driver.update({
        where: { id },
        data: { device_token },
      });
    }
  }

  private async findCustomerByOtp(otp: string) {
    const token = await this.db.customerOtpToken.findFirst({
      where: { otp },
      orderBy: { created_at: "desc" },
    });

    if (!token) {
      return null;
    }

    return this.db.customer.findUnique({
      where: { id: token.customer_id },
    });
  }

  private async findDriverByOtp(otp: string) {
    const token = await this.db.driverOtpToken.findFirst({
      where: { otp },
      orderBy: { created_at: "desc" },
    });

    if (!token) {
      return null;
    }

    return this.db.driver.findUnique({
      where: { id: token.driver_id },
    });
  }
}
