import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { bullConfig } from '../../config/bull';
import { AppQueuesModule } from './appQueues.module';

@Module({
  imports: [BullModule.forRoot(bullConfig), AppQueuesModule],
  exports: [AppQueuesModule],
})
export class QueuesModule {}
