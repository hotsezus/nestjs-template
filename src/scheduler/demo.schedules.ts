import { Injectable, Logger } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';

@Injectable()
export class DemoSchedules {
  logger = new Logger(DemoSchedules.name);

  @Timeout(1)
  async reportSchedulerStart() {
    this.logger.log('Scheduler started');
  }
}
