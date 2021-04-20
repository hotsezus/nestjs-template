import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { WorkerModule } from '../worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  // Не отключаем стандартное логирование при создании приложения выше
  // Если выключить, не получается отладить ошибки, возникающие при инициализации
  app.useLogger(app.get(Logger));
  await app.init();
}
bootstrap();
