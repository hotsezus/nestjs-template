import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { SchedulerModule } from '../scheduler.module';

async function bootstrap() {
  const app = await NestFactory.create(SchedulerModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.flushLogs();

  await app.init();
}
bootstrap().catch((e) => console.error(`Uncaught error`, e));
