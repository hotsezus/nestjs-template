import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import { Logger } from 'nestjs-pino';
import { join } from 'path';

import { ApiModule } from './api/api.module';
import { appHost, appPort, jsonLimit } from './config/environment';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule, {
    // @see https://github.com/iamolegga/nestjs-pino#v2
    bufferLogs: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: jsonLimit }));

  // Не отключаем стандартное логирование при создании приложения выше
  // Если выключить, не получается отладить ошибки, возникающие при инициализации
  app.useLogger(app.get(Logger));

  // Активируем рендеринг ejs шаблонов
  app.setBaseViewsDir([join(process.cwd(), 'views')]);
  app.setViewEngine('ejs');

  // Глобальный middleware для возможности использовать cookie в REST API
  app.use(cookieParser());

  await app.listen(appPort, appHost);
}

bootstrap().catch((e) => console.error(`Uncaught error`, e));
