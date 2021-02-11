import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';

import { CliCommandsModule } from './cli/cliCommands.module';
import { TestCommand } from './cli/test.command';
import { isProduction } from './config/environment';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    CliCommandsModule,
    DatabaseModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: isProduction ? 'info' : 'debug',
        prettyPrint: !isProduction,
        redact: [
          // В целях безопасности не логируем кукисы
          'req.headers.cookie',
          // И токен аутентификации
          'req.headers.authorization',
        ],
        timestamp: stdTimeFunctions.isoTime,
      },
    }),
  ],
  providers: [TestCommand],
})
export class CliModule {}
