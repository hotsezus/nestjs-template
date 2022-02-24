import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';

import { UserDatabaseModule } from '../api/user/database/user.database-module';
import { CommonModule } from '../common/common.module';
import { QueuesModule } from '../common/queues/queues.module';
import { TestCommand } from './commands/test.command';
import { UserCommand } from './commands/user.command';

@Module({
  imports: [CommonModule, CommandModule, QueuesModule, UserDatabaseModule],
  providers: [TestCommand, UserCommand],
})
export class CliModule {}
