import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { Queues } from '../../bull.config';

export interface TestQueuePayload {
  msg: string;
}

@Injectable()
export class TestQueueService {
  constructor(
    @InjectQueue(Queues.test)
    private readonly testQueue: Queue<TestQueuePayload>,
  ) {}

  async add(payload: TestQueuePayload) {
    return await this.testQueue.add(payload);
  }
}
