import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';

import { QueuesModule } from '../common/queues/queues.module';
import { TestCommand } from './commands/test.command';

@Module({
  imports: [CommandModule, QueuesModule],
  providers: [TestCommand],
})
export class CommandsModule {}
