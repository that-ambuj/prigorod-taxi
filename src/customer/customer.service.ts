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
    const { search_from, search_to, show_filled } = search;

    if (!search_from && !search_to) {
      return this.db.trip.findMany({
        where: { status: "PENDING", is_full: show_filled },
        take: page.limit,
        skip: page.skip(),
        orderBy: { created_at: "asc" },
        include: { driver: { include: { car: true } } },
      });
    }

    return this.db.trip.findMany({
      where: {
        status: "PENDING",
        is_full: show_filled,
        AND: [
          { from: { contains: search_from?.toLowerCase() ?? "" } },
          { to: { contains: search_to?.toLowerCase() ?? "" } },
        ],
      },
      take: page.limit,
      skip: page.skip(),
      orderBy: { created_at: "asc" },
      include: { driver: { include: { car: true } } },
    });
  }

  public async getTripsListCustomer(
    page: PaginationDto,
    customer_id: string,
  ): Promise<Trip[]> {
    return this.db.trip.findMany({
      where: { tickets: { some: { customer_id } } },
      take: page.limit,
      skip: page.skip(),
      orderBy: { created_at: "desc" },
      include: {
        driver: { include: { car: true } },
        tickets: { where: { customer_id } },
      },
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
    quantity: number,
  ): Promise<Trip | null> {
    const already_booked = await this.db.trip.findUnique({
      where: { id: trip_id, tickets: { some: { customer_id } } },
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

    const available_seats = trip.total_seats - trip.reserved_seats;

    if (quantity > available_seats) {
      throw new ForbiddenException(
        `Trip with id ${trip.id} can't be booked because there are not enough (${available_seats}) seats available.`,
      );
    }

    const is_full = trip.reserved_seats === trip.total_seats - quantity;

    return this.db.trip.update({
      where: { id: trip_id },
      data: {
        is_full,
        tickets: {
          create: {
            customer_id,
            quantity,
          },
        },
        reserved_seats: { increment: quantity },
      },
      include: {
        driver: { include: { car: true } },
        tickets: { where: { customer_id } },
      },
    });
  }

  public async cancelTrip(
    trip_id: string,
    customer_id: string,
  ): Promise<Trip | null> {
    const ticket = await this.db.ticket.findFirst({
      where: { customer_id, trip_id },
    });

    if (!ticket) {
      throw new ForbiddenException(
        `Trip with id ${trip_id} can't be cancelled because it is not already booked by the user.`,
      );
    }

    if (ticket.is_cancelled) {
      throw new ForbiddenException(
        `Trip with id ${trip_id} can't be cancelled because it already cancelled by the user.`,
      );
    }

    const trip = await this.db.trip.findUnique({
      where: { id: trip_id },
    });

    if (!trip) return null;

    if (trip.status !== "PENDING") {
      throw new ForbiddenException(
        `Trip with id ${trip.id} can't be cancelled because it is ${trip.status}.`,
      );
    }

    return this.db.trip.update({
      where: { id: trip_id },
      data: {
        is_full: false,
        tickets: {
          update: { where: { id: ticket.id }, data: { is_cancelled: true } },
        },
        reserved_seats: { decrement: ticket.quantity },
      },
      include: {
        driver: { include: { car: true } },
        tickets: { where: { customer_id } },
      },
    });
  }
}
