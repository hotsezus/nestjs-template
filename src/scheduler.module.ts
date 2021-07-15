import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CommonModule } from './common/common.module';
import { AppSchedulesModule } from './scheduler/appSchedules.module';

@Module({
  imports: [CommonModule, ScheduleModule.forRoot(), AppSchedulesModule],
})
export class SchedulerModule {}
