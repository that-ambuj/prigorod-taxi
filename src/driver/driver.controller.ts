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
import { Driver, Trip } from "@prisma/client";
import {
  ChangeTripStatusDto,
  TripStatusAction,
} from "./dto/change-trip-status.dto";
import { ApiQuery, ApiTags } from "@nestjs/swagger";

@UseGuards(DriverGuard)
@ApiTags("Driver Trips")
@Controller("driver")
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

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

    let result: Trip = undefined;

    switch (data.action) {
      case TripStatusAction.MARK_CANCELLED:
        result = await this.driverService.cancelTrip(id, driver.id);
      case TripStatusAction.MARK_FILLED:
        result = await this.driverService.markTripFilled(id, driver.id);
      case TripStatusAction.MARK_DEPARTED:
        result = await this.driverService.markTripDeparted(id, driver.id);
      case TripStatusAction.MARK_COMPLETED:
        result = await this.driverService.markTripCompleted(id, driver.id);
    }

    if (!result)
      throw new NotFoundException(`Trip with id ${id} does not exist.`);

    return result;
  }
}
