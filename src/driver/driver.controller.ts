import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { DriverService } from "./driver.service";
import { DriverGuard } from "@app/guards/driver.guard";
import { PaginationDto } from "@shared/pagination.dto";
import { CreateTripDto } from "./dto/create-trip.dto";
import { FastifyRequest } from "fastify";
import { Driver, Ticket, Trip } from "@prisma/client";
import {
  ChangeTripStatusDto,
  TripStatusAction,
} from "./dto/change-trip-status.dto";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import {
  NotifDataWithoutUserId,
  NotificationService,
} from "@app/firebase/notification.service";

@UseGuards(DriverGuard)
@ApiTags("Driver Trips")
@Controller("driver")
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    private readonly notif: NotificationService,
  ) {}

  @Get("trips")
  async fetchTripHistory(
    @Query() page: PaginationDto,
    @Req() req: FastifyRequest,
  ) {
    const driver = req["user"] as Driver;

    return this.driverService.listTrips(page, driver.id);
  }

  @Get("trips/:id")
  async fetchTripOne(@Param("id") id: string, @Req() req: FastifyRequest) {
    const driver = req["user"] as Driver;

    const trip = await this.driverService.getTripByDriverAndId(id, driver.id);

    if (!trip) throw new NotFoundException(`trip with id ${id} not found`);

    return trip;
  }

  @Post("trips")
  async createTrip(@Body() trip: CreateTripDto, @Req() req: FastifyRequest) {
    const driver = req["user"] as Driver;

    return this.driverService.createTrip(trip, driver.id);
  }

  @Put("trips/:id")
  @ApiQuery({
    name: "action",
    enum: TripStatusAction,
    enumName: "TripStatusAction",
    required: true,
    isArray: false,
  })
  async changeTripStatus(
    @Param("id") id: string,
    @Req() req: FastifyRequest,
    @Query() data: ChangeTripStatusDto,
  ) {
    const driver = req["user"] as Driver;

    let trip: Trip & { tickets: Ticket[] } = undefined;

    let notif_data: NotifDataWithoutUserId = undefined;

    switch (data.action) {
      case TripStatusAction.MARK_CANCELLED:
        trip = await this.driverService.cancelTrip(id, driver.id);

        notif_data = {
          payload: { event_type: "TRIP_CANCELLED", trip },
          title: "Trip Cancelled",
          body: `Your trip from ${trip.from} to ${trip.to} has been cancelled by the driver.`,
        };

        break;
      case TripStatusAction.MARK_FILLED:
        trip = await this.driverService.markTripFilled(id, driver.id);
        break;
      case TripStatusAction.MARK_DEPARTED:
        trip = await this.driverService.markTripDeparted(id, driver.id);

        notif_data = {
          payload: { event_type: "TRIP_DEPARTED", trip },
          title: "Trip Departed!",
          body: `Your trip from ${trip.from} to ${trip.to} has departed.`,
        };

        break;
      case TripStatusAction.MARK_COMPLETED:
        trip = await this.driverService.markTripCompleted(id, driver.id);

        notif_data = {
          payload: { event_type: "TRIP_COMPLETED", trip },
          title: "Trip Completed!",
          body: `Your trip from ${trip.from} to ${trip.to} has been completed!`,
        };

        break;
    }

    if (!trip)
      throw new NotFoundException(`Trip with id ${id} does not exist.`);

    if (notif_data) {
      await Promise.all(
        trip.tickets
          .filter(({ is_cancelled }) => !is_cancelled)
          .map(async ({ customer_id }) => {
            await this.notif.sendNotification({
              user_id: customer_id,
              ...notif_data,
            });
          }),
      );
    }

    return trip;
  }
}
