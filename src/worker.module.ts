import { Module } from '@nestjs/common';

import { ProcessorsModule } from './jobs/processors/processors.module';
import { SystemModule } from './system/system.module';

@Module({
  imports: [SystemModule, ProcessorsModule],
})
export class WorkerModule {}
