import { Injectable } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { Logger } from 'nestjs-pino';

@Injectable()
export class BasicScheduleService {
  constructor(private readonly logger: Logger) {}

  @Timeout(1)
  async reportSchedulerStart() {
    this.logger.log('Scheduler started');
  }
}
