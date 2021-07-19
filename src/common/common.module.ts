import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';

import { isProduction } from '../config/environment';
import { DatabaseModule } from '../database/database.module';
import { AllExceptionsFilter } from './allExceptionsFilter';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
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
    DatabaseModule,
    QueuesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [DatabaseModule, LoggerModule],
})
export class CommonModule {}
