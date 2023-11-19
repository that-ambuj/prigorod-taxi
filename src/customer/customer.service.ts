import { PrismaService } from "@app/prisma/prisma.service";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { PaginationDto } from "@shared/pagination.dto";
import { SearchDto } from "./dto/search.dto";
import { Trip } from "@prisma/client";

@Injectable()
export class CustomerService {
  constructor(private readonly db: PrismaService) {}

  public async searchTrips(
    page: PaginationDto,
    search?: SearchDto,
  ): Promise<Trip[]> {
    if (!search.search_from && !search.search_to) {
      return this.db.trip.findMany({
        where: { status: "PENDING" },
        take: page.limit,
        skip: page.skip(),
        include: { driver: { include: { car: true } } },
      });
    }

    const { search_from, search_to } = search;

    return this.db.trip.findMany({
      where: {
        status: "PENDING",
        OR: [
          { from_city: { contains: search_from?.toLowerCase() ?? "" } },
          { from_village: { contains: search_from?.toLowerCase() ?? "" } },
          { to_city: { contains: search_to?.toLowerCase() ?? "" } },
          { to_village: { contains: search_to?.toLowerCase() ?? "" } },
        ],
      },
      take: page.limit,
      skip: page.skip(),
      include: { driver: { include: { car: true } } },
    });
  }

  public async getTripsListCustomer(
    page: PaginationDto,
    customer_id: string,
  ): Promise<Trip[]> {
    return this.db.trip.findMany({
      where: { passengers: { some: { id: customer_id } } },
      take: page.limit,
      skip: page.skip(),
      include: { driver: { include: { car: true } } },
    });
  }

  public async getTripById(id: string): Promise<Trip | null> {
    return this.db.trip.findUnique({
      where: { id },
      include: { driver: { include: { car: true } } },
    });
  }

  public async bookTrip(
    trip_id: string,
    customer_id: string,
  ): Promise<Trip | null> {
    const already_booked = await this.db.trip.findUnique({
      where: { id: trip_id, passengers: { some: { id: customer_id } } },
    });

    if (already_booked) {
      throw new ForbiddenException(
        `Trip with id ${trip_id} is already booked by the user.`,
      );
    }

    const trip = await this.db.trip.findUnique({
      where: { id: trip_id },
    });

    if (!trip) return null;

    if (trip.status !== "PENDING") {
      throw new ForbiddenException(
        `Trip with id ${trip.id} can't be booked because it is ${trip.status}.`,
      );
    }

    if (trip.reserved_seats === trip.total_seats) {
      throw new ForbiddenException(
        `Trip with id ${trip.id} can't be booked because it is FILLED.`,
      );
    }

    return this.db.trip.update({
      where: { id: trip_id },
      data: {
        passengers: { connect: { id: customer_id } },
        reserved_seats: { increment: 1 },
      },
      include: { driver: { include: { car: true } } },
    });
  }

  public async cancelTrip(
    trip_id: string,
    customer_id: string,
  ): Promise<Trip | null> {
    const already_booked = await this.db.trip.findUnique({
      where: { id: trip_id, passengers: { some: { id: customer_id } } },
    });

    if (!already_booked) {
      throw new ForbiddenException(
        `Trip with id ${trip_id} can't be cancelled because it is not already booked by the user.`,
      );
    }

    const trip = await this.db.trip.findUnique({
      where: { id: trip_id },
    });

    if (!trip) return null;

    if (!(trip.status === "PENDING" || trip.status === "FILLED")) {
      throw new ForbiddenException(
        `Trip with id ${trip.id} can't be cancelled because it is ${trip.status}.`,
      );
    }

    return this.db.trip.update({
      where: { id: trip_id },
      data: {
        passengers: { disconnect: { id: customer_id } },
        reserved_seats: { decrement: 1 },
      },
      include: { driver: { include: { car: true } } },
    });
  }
}
