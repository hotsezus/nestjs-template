import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import {
  BULL_QUEUE_TEST,
  BullQueueTestPayload,
} from '../../common/queues/test.queue';
import { BaseProcessor } from './base.processor';

/**
 * Конкретный класс обработчика тестовой очереди
 */
@Processor(BULL_QUEUE_TEST)
export class TestQueueProcessor extends BaseProcessor {
  constructor() {
    super(BULL_QUEUE_TEST, new Logger(TestQueueProcessor.name));
  }

  @Process()
  public async process(job: Job<BullQueueTestPayload>) {
    this.logger.log({
      msg: 'Processing test job',
      data: job.data,
    });
  }
}
