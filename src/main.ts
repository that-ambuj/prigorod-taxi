import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import secureSession from '@fastify/secure-session';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import metadata from './metadata';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: process.env['NODE_ENV'] === 'production',
    }),
  );

  await app.register(secureSession, {
    secret: 'averylogphrasebiggerthanthirtytwochars',
    salt: 'mq9hDxBVDbspDR6n',
    sessionName: 'session',
    cookieName: 'auth-session',
    cookie: {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    },
  });

  app.enableVersioning();
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  if (process.env['ENV'] === 'development') {
    const swagger_config = new DocumentBuilder()
      .setTitle('Prigorod Taxi')
      .setVersion('1.0')
      .build();

    await SwaggerModule.loadPluginMetadata(metadata);
    const document = SwaggerModule.createDocument(app, swagger_config);

    SwaggerModule.setup('api', app, document);
  }

  await app.listen(3000);
}
bootstrap();
