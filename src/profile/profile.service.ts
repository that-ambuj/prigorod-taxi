import { Injectable } from "@nestjs/common";
import { Customer, Driver } from "@prisma/client";
import { ProfileUpdateDto } from "./dto/profile-update.dto";
import { PrismaService } from "@app/prisma/prisma.service";

type UserType = {
  user_type: "CUSTOMER" | "DRIVER";
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
  ): Promise<(Driver & UserType) | (Customer & UserType) | null> {
    let user: Driver | Customer;

    user = await this.prisma.customer.findUnique({ where: { id } });
    if (user) {
      return { ...user, user_type: "CUSTOMER" };
    }

    user = await this.prisma.driver.findUnique({
      where: { id },
      include: { car: true },
    });
    if (user) {
      return { ...user, user_type: "DRIVER" };
    }

    return null;
  }

  async update(user_id: string, data: ProfileUpdateDto) {
    const user = await this.findById(user_id);

    if (!user) {
      return null;
    }

    const updated =
      user.user_type == "CUSTOMER"
        ? await this.updateCustomerById(user.id, data)
        : await this.updateDriverById(user.id, data);

    return updated;
  }

  private async updateCustomerById(id: string, data: ProfileUpdateDto) {
    return this.prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        city: data.city,
        village: data.village,
      },
    });
  }

  private async updateDriverById(id: string, data: ProfileUpdateDto) {
    const car_info = {
      model: data.car_model,
      brand: data.car_brand,
      color: data.car_color,
      license_number: data.car_number,
    };

    return this.prisma.driver.update({
      where: { id },
      include: { car: true },
      data: {
        name: data.name,
        village: data.village,
        city: data.city,
        car: {
          upsert: {
            where: { driver_id: id },
            create: car_info,
            update: car_info,
          },
        },
      },
    });
  }
}
