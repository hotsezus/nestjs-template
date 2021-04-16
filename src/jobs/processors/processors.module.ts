import { Module } from '@nestjs/common';

import { TestQueueProcessor } from './testQueue.processor';

@Module({
  imports: [],
  providers: [TestQueueProcessor],
})
export class ProcessorsModule {}
