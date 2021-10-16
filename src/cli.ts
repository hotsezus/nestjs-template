import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { Logger } from 'nestjs-pino';

import { CliModule } from './cli/cli.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.flushLogs();

  await app.select(CommandModule).get(CommandService).exec();
  await app.close();

  process.exit();
}

bootstrap().catch((e) => console.error(`Uncaught error`, e));
