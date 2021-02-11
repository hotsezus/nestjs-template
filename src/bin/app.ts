import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import { Logger } from 'nestjs-pino';

import { AppModule } from '../app.module';

// Номер инстанса в кластерном режиме pm2
const appInstance = +process.env.NODE_APP_INSTANCE || 0;
const port = (+process.env.APP_PORT || 5000) + appInstance;
const host = process.env.APP_HOST || 'localhost';

// Ограничение размера принимаемого json
// Актуально при необходимости обрабатывать большие запросы размером body более 100kb
const jsonLimit = process.env.JSON_BODY_LIMIT || '1mb';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: jsonLimit }));

  // Не отключаем стандартное логирование при создании приложения выше
  // Если выключить, не получается отладить ошибки, возникающие при инициализации
  app.useLogger(app.get(Logger));

  // Глобальный middleware для возможности использовать cookie в REST API
  app.use(cookieParser());

  await app.listen(port, host);
}

bootstrap().catch((e) => console.error(`Uncaught error`, e));
