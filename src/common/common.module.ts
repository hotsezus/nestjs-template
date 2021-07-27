import { Module } from '@nestjs/common';
import { RedisModule } from 'nest-module-redis';
import { LoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';

import { isProduction } from '../config/environment';
import { redis } from '../config/redis';
import { DatabaseModule } from '../database/database.module';
import { ExceptionsModule } from './exceptions/exceptions.module';
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
    RedisModule.forRoot(redis),
    DatabaseModule,
    QueuesModule,
    ExceptionsModule,
  ],
  exports: [DatabaseModule, LoggerModule],
})
export class CommonModule {}
