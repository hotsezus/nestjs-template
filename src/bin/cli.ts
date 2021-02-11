import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { Logger } from 'nestjs-pino';

import { CliModule } from '../cli.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule);
  app.useLogger(app.get(Logger));
  app.select(CommandModule).get(CommandService).exec();
}

bootstrap().catch((e) => console.error(`Uncaught error`, e));
