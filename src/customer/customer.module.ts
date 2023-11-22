import { Module } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { NotificationService } from "@app/firebase/notification.service";

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, NotificationService],
})
export class CustomerModule {}
