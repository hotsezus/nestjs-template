import { Module } from '@nestjs/common';

import { TestQueueProcessor } from './processors/testQueue.processor';

/**
 * Регистрация процессоров очередей основного воркера
 */
@Module({
  imports: [],
  providers: [TestQueueProcessor],
})
export class WorkerProcessorsModule {}
