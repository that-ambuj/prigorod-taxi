import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { fastifyMiddie } from "@fastify/middie";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { validate } from "./config";
import { ProfileModule } from "./profile/profile.module";
import { HealthModule } from "./health/health.module";
import { AppController } from "./app.controller";
import { DriverModule } from "./driver/driver.module";
import { CustomerModule } from "./customer/customer.module";
import { WhatsappService } from "./whatsapp.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ConfigModule.forRoot({ validate, expandVariables: true }),
    HealthModule,
    PrismaModule,
    AuthModule,
    ProfileModule,
    DriverModule,
    CustomerModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [OtpService, WhatsappService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(fastifyMiddie);
  }
}
