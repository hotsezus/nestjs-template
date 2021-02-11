import { Injectable } from '@nestjs/common';
import { Command, Option, Positional } from 'nestjs-command';
import { Logger } from 'nestjs-pino';

@Injectable()
export class TestCommand {
  constructor(private logger: Logger) {}

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
}
