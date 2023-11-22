import { Module } from "@nestjs/common";
import { DriverService } from "./driver.service";
import { DriverController } from "./driver.controller";
import { NotificationService } from "@app/firebase/notification.service";

@Module({
  controllers: [DriverController],
  providers: [DriverService, NotificationService],
})
export class DriverModule {}
