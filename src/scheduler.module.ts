import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CommonModule } from './common/common.module';
import { BasicScheduleService } from './scheduler/basicSchedule.service';

@Module({
  imports: [CommonModule, ScheduleModule.forRoot()],
  providers: [BasicScheduleService],
})
export class SchedulerModule {}
