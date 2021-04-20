import { Module } from '@nestjs/common';

import { TestQueueProcessor } from './processors/testQueue.processor';

@Module({
  imports: [],
  providers: [TestQueueProcessor],
})
export class ProcessorsModule {}
