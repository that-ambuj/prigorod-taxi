import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  NestFastifyApplication,
  FastifyAdapter,
} from "@nestjs/platform-fastify";
import secureSession from "@fastify/secure-session";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import metadata from "./metadata";
import { Environment } from "@config";
import { initializeApp } from "firebase-admin/app";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: process.env["NODE_ENV"] === "production",
    }),
  );

  await app.register(secureSession, {
    secret: "averylogphrasebiggerthanthirtytwochars",
    salt: "mq9hDxBVDbspDR6n",
    sessionName: "session",
    cookieName: "auth-session",
    cookie: {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    },
  });

  initializeApp();

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config_service = app.get(ConfigService);

  const swagger_config = new DocumentBuilder()
    .setTitle("Prigorod Taxi API")
    .addServer("/")
    .addServer("/prigorod")
    .setVersion("1.0")
    .build();

  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, swagger_config);

  SwaggerModule.setup("api", app, document);

  const port = config_service.get<number>("PORT");
  const addr = config_service.get<string>("ADDR");

  await app.listen(port, addr);
}
void bootstrap();
