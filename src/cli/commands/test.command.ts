import { Injectable } from '@nestjs/common';
import { Command, Option, Positional } from 'nestjs-command';
import { Logger } from 'nestjs-pino';

import { TestQueueService } from '../../common/queues/testQueue/testQueue.service';

@Injectable()
export class TestCommand {
  constructor(
    private logger: Logger,
    private readonly testQueueService: TestQueueService,
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
    await this.testQueueService.add({ msg: 'Test queue msg' });
  }
}
