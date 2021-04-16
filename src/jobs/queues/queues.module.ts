import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { bullConfig } from '../bull.config';
import { TestQueueModule } from './testQueue/testQueue.module';

@Module({
  imports: [BullModule.forRoot(bullConfig), TestQueueModule],
  exports: [TestQueueModule],
})
export class QueuesModule {}
