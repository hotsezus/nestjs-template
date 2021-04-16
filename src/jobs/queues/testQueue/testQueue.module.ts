import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { Queues } from '../../bull.config';
import { TestQueueService } from './testQueue.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: Queues.test,
    }),
  ],
  providers: [TestQueueService],
  exports: [BullModule, TestQueueService],
})
export class TestQueueModule {}
