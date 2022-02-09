import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'nest-module-redis';
import { LoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';

import { isProduction } from '../config/environment';
import { ormConfig } from '../config/ormconfig';
import { redis } from '../config/redis';
import { ExceptionsModule } from './exceptions/exceptions.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: isProduction ? 'info' : 'debug',
        transport: isProduction
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
              },
            },
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
    TypeOrmModule.forRoot(ormConfig),
    QueuesModule,
    ExceptionsModule,
  ],
  exports: [LoggerModule],
})
export class CommonModule {}
