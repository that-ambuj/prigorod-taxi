import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { fastifyMiddie } from "@fastify/middie";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { validate } from "./config";
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate, expandVariables: true }),
    PrismaModule,
    AuthModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [OtpService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(fastifyMiddie);
  }
}
