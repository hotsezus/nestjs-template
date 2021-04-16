import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';

import { QueuesModule } from '../jobs/queues/queues.module';
import { TestCommand } from './test.command';

@Module({
  imports: [CommandModule, QueuesModule],
  providers: [TestCommand],
})
export class CliCommandsModule {}
