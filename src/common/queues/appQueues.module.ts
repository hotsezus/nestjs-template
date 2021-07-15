import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { BULL_QUEUE_TEST } from './test.queue';

/**
 * Регистрация всех очередей этого модуля
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: BULL_QUEUE_TEST,
    }),
  ],
  exports: [BullModule],
})
export class AppQueuesModule {}
