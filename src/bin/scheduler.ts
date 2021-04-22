import 'dotenv/config';

import { NestFactory } from '@nestjs/core';

import { SchedulerModule } from '../scheduler.module';

/**
 * Запускает модуль консольного интерфейса
 */
async function bootstrap() {
  const app = await NestFactory.create(SchedulerModule);

  await app.init();
}

bootstrap().catch((e) => console.error(`Uncaught error`, e));
