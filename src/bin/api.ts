import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import { Logger } from 'nestjs-pino';

import { ApiModule } from '../api.module';
import { appHost, appPort, jsonLimit } from '../config/environment';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: jsonLimit }));

  // Не отключаем стандартное логирование при создании приложения выше
  // Если выключить, не получается отладить ошибки, возникающие при инициализации
  app.useLogger(app.get(Logger));

  // Глобальный middleware для возможности использовать cookie в REST API
  app.use(cookieParser());

  await app.listen(appPort, appHost);
}

bootstrap().catch((e) => console.error(`Uncaught error`, e));
