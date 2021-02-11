import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';

import { TestCommand } from './test.command';

@Module({
  imports: [CommandModule],
  providers: [TestCommand],
})
export class CliCommandsModule {}
