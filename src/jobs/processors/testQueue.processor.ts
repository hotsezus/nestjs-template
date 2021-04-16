import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { Queues } from '../bull.config';
import { TestQueuePayload } from '../queues/testQueue/testQueue.service';

@Processor(Queues.test)
export class TestQueueProcessor {
  private readonly logger = new Logger(TestQueueProcessor.name);

  @OnQueueFailed()
  async onFailed(job: Job, err: Error) {
    this.logger.log(
      `'test' job ${job.id} failed with error: ${JSON.stringify(err)}`,
    );
  }

  @OnQueueCompleted()
  async onCompleted(job: Job<TestQueuePayload>) {
    this.logger.log(`'test' job ${job.id} completed`);
  }

  @Process()
  async process(job: Job<TestQueuePayload>) {
    this.logger.log(
      `Processing 'test' job ${job.id} with data ${JSON.stringify(job.data)}`,
    );
  }
}
