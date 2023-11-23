import { PrismaService } from "@app/prisma/prisma.service";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { PaginationDto } from "@shared/pagination.dto";
import { CreateTripDto } from "./dto/create-trip.dto";

const include = {
  driver: { include: { car: true } },
  passengers: true,
} as const;

@Injectable()
export class DriverService {
  constructor(private readonly db: PrismaService) {}

  public async listTrips(page: PaginationDto, driver_id: string) {
    return this.db.trip.findMany({
      take: page.limit,
      skip: page.skip(),
      include: { driver: { include: { car: true } } },
      where: { driver_id },
      orderBy: { created_at: "desc" },
    });
  }

  public async getTripByDriverAndId(id: string, driver_id: string) {
    return this.db.trip.findUnique({
      where: { id, driver_id },
      include,
    });
  }

  public async createTrip(trip: CreateTripDto, driver_id: string) {
    return this.db.trip.create({
      data: {
        ...trip,
        driver_id,
      },
      include,
    });
  }

  public async cancelTrip(trip_id: string, driver_id: string) {
    const trip = await this.db.trip.findUnique({
      where: { id: trip_id, driver_id },
    });

    if (!trip) return null;

    if (trip.status !== "PENDING" && trip.status !== "CANCELLED")
      throw new ForbiddenException(
        `A ${trip.status} trip cannot be cancelled.`,
      );

    return this.db.trip.update({
      where: { id: trip.id, driver_id },
      data: { status: "CANCELLED" },
      include,
    });
  }

  public async markTripFilled(trip_id: string, driver_id: string) {
    const trip = await this.db.trip.findUnique({
      where: { id: trip_id, driver_id },
    });

    if (!trip) return null;

    return this.db.trip.update({
      where: { id: trip.id, driver_id },
      data: { is_full: true },
      include,
    });
  }

  public async markTripDeparted(trip_id: string, driver_id: string) {
    const trip = await this.db.trip.findUnique({
      where: { id: trip_id, driver_id },
    });

    if (!trip) return null;

    if (trip.status !== "PENDING") {
      throw new ForbiddenException(
        `Cannot mark a ${trip.status} trip as DEPARTED.`,
      );
    }

    return this.db.trip.update({
      where: { id: trip.id, driver_id },
      data: { status: "DEPARTED" },
      include,
    });
  }

  public async markTripCompleted(trip_id: string, driver_id: string) {
    const trip = await this.db.trip.findUnique({
      where: { id: trip_id, driver_id },
    });

    if (!trip) return null;

    if (trip.status !== "DEPARTED") {
      throw new ForbiddenException(
        `Cannot mark a ${trip.status} trip as COMPLETED.`,
      );
    }

    return this.db.trip.update({
      where: { id: trip.id, driver_id },
      data: { status: "COMPLETED" },
      include,
    });
  }
}
