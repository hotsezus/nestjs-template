import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { WorkerProcessorsModule } from './workerProcessors.module';

@Module({
  imports: [CommonModule, WorkerProcessorsModule],
})
export class WorkerModule {}
