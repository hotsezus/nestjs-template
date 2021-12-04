import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.flushLogs();

  await app.init();
}
bootstrap().catch((e) => console.error(`Uncaught error`, e));
