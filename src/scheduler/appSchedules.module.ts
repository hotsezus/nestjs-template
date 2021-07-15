import { Module } from '@nestjs/common';

import { DemoSchedules } from './demo.schedules';

@Module({
  providers: [DemoSchedules],
  exports: [DemoSchedules],
})
export class AppSchedulesModule {}
