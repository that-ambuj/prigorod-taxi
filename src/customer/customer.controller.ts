import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomerGuard } from "@app/guards/customer.guard";
import { FastifyRequest } from "fastify";
import { SearchDto } from "./dto/search.dto";
import { PaginationDto } from "@shared/pagination.dto";
import { ApiTags } from "@nestjs/swagger";
import { Customer } from "@prisma/client";
import { NotificationService } from "@app/firebase/notification.service";

@ApiTags("Customer Trips")
@UseGuards(CustomerGuard)
@Controller("customer")
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly notif: NotificationService,
  ) {}

  @Get("trips")
  async searchTrips(@Query() query: SearchDto, @Query() page: PaginationDto) {
    return this.customerService.searchTrips(page, query);
  }

  @Get("trips/history")
  async fetchTripsHistory(
    @Req() req: FastifyRequest,
    @Query() page: PaginationDto,
  ) {
    const customer = req["user"] as Customer;
    return this.customerService.getTripsListCustomer(page, customer.id);
  }

  @Get("trips/:id")
  async fetchTripOne(@Param("id") id: string) {
    return this.customerService.getTripById(id);
  }

  @Post("trips/:id/book")
  async bookTrip(@Param("id") id: string, @Req() req: FastifyRequest) {
    const customer = req["user"] as Customer;

    const updated_trip = await this.customerService.bookTrip(id, customer.id);

    if (!updated_trip) {
      throw new NotFoundException(`Trip with id ${id} was not found.`);
    }

    await this.notif.sendNotification({
      user_id: updated_trip.driver_id,
      payload: { event_type: "PASSENGER_BOOKED", trip: updated_trip },
      title: "A passenger booked a trip!",
      body: `${customer.name ?? "Someone"} just booked a trip with you!`,
    });

    return updated_trip;
  }

  @Post("trips/:id/cancel")
  async cancelTrip(@Param("id") id: string, @Req() req: FastifyRequest) {
    const customer = req["user"] as Customer;

    const updated_trip = await this.customerService.cancelTrip(id, customer.id);

    if (!updated_trip) {
      throw new NotFoundException(`Trip with id ${id} was not found.`);
    }

    await this.notif.sendNotification({
      user_id: updated_trip.driver_id,
      payload: { event_type: "PASSENGER_CANCELLED", trip: updated_trip },
      title: "A Passenger cancelled a trip with you.",
      body: `${customer.name ?? "Someone"} just cancelled a trip with you.`,
    });

    return updated_trip;
  }
}
