import { PrismaService } from "@app/prisma/prisma.service";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaginationDto } from "@shared/pagination.dto";
import { CreateTripDto } from "./dto/create-trip.dto";
import { Trip } from "@prisma/client";

@Injectable()
export class DriverService {
  constructor(private readonly db: PrismaService) {}

  public async listTrips(page: PaginationDto, driver_id: string) {
    return this.db.trip.findMany({
      take: page.limit,
      skip: page.skip(),
      include: {
        driver: { include: { car: true } },
      },
      where: {
        driver_id,
      },
    });
  }

  public async getTripByDriverAndId(id: string, driver_id: string) {
    return this.db.trip.findUnique({
      where: { id, driver_id },
      include: { driver: { include: { car: true } }, passengers: true },
    });
  }

  public async createTrip(trip: CreateTripDto, driver_id: string) {
    return this.db.trip.create({
      data: {
        ...trip,
        driver_id,
      },
    });
  }

  public async cancelTrip(
    trip_id: string,
    driver_id: string,
  ): Promise<Trip | null> {
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
    });
  }

  public async markTripFilled(
    trip_id: string,
    driver_id: string,
  ): Promise<Trip | null> {
    const trip = await this.db.trip.findUnique({
      where: { id: trip_id, driver_id },
    });

    if (!trip) return null;

    if (trip.status !== "PENDING" && trip.status !== "FILLED")
      throw new ForbiddenException(
        `Cannot mark a ${trip.status} trip as filled.`,
      );

    return this.db.trip.update({
      where: { id: trip.id, driver_id },
      data: { status: "FILLED" },
    });
  }

  public async markTripDeparted(
    trip_id: string,
    driver_id: string,
  ): Promise<Trip | null> {
    const trip = await this.db.trip.findUnique({
      where: { id: trip_id, driver_id },
    });

    if (!trip) return null;

    if (trip.status === "CANCELLED") {
      throw new ForbiddenException(
        `Cannot mark a ${trip.status} trip as DEPARTED.`,
      );
    }

    return this.db.trip.update({
      where: { id: trip.id, driver_id },
      data: { status: "DEPARTED" },
    });
  }

  public async markTripCompleted(
    trip_id: string,
    driver_id: string,
  ): Promise<Trip | null> {
    const trip = await this.db.trip.findUnique({
      where: { id: trip_id, driver_id },
    });

    if (!trip) return null;

    if (trip.status === "CANCELLED" || trip.status === "PENDING") {
      throw new ForbiddenException(
        `Cannot mark a ${trip.status} trip as COMPLETED.`,
      );
    }

    return this.db.trip.update({
      where: { id: trip.id, driver_id },
      data: { status: "COMPLETED" },
    });
  }
}
