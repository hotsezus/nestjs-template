import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';

import { QueuesModule } from '../common/queues/queues.module';
import { UserModule } from '../database/entities/user/user.module';
import { TestCommand } from './commands/test.command';
import { UserCommand } from './commands/user.command';

@Module({
  imports: [CommandModule, QueuesModule, UserModule],
  providers: [TestCommand, UserCommand],
})
export class CommandsModule {}
