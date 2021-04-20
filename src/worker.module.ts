import { Module } from '@nestjs/common';

import { CommonModule } from './common/common.module';
import { ProcessorsModule } from './worker/processors.module';

@Module({
  imports: [CommonModule, ProcessorsModule],
})
export class WorkerModule {}
