import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { Command, Option, Positional } from 'nestjs-command';

import {
  BULL_QUEUE_TEST,
  BullQueueTestPayload,
} from '../../common/queues/test.queue';

@Injectable()
export class TestCommand {
  protected readonly logger = new Logger(TestCommand.name);

  constructor(
    @InjectQueue(BULL_QUEUE_TEST)
    private readonly testQueue: Queue<BullQueueTestPayload>,
  ) {}

  @Command({
    command: 'test <value>',
  })
  async test(
    @Positional({
      name: 'value',
      describe: 'string to return',
      type: 'string',
    })
    value: string,
    @Option({
      name: 'case',
      choices: ['upper', 'lower'],
      alias: 'c',
    })
    target_case: string,
  ) {
    if (target_case) {
      switch (target_case) {
        case 'upper':
          value = value.toUpperCase();
          break;
        case 'lower':
          value = value.toLowerCase();
          break;
      }
    }
    this.logger.log(value);
  }

  @Command({
    command: 'test:worker',
  })
  async testWorker() {
    await this.testQueue.add({ payload: 'Test queue msg' });
  }
}
