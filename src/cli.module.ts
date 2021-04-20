import { Module } from '@nestjs/common';

import { CommandsModule } from './cli/commands.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CommonModule, CommandsModule],
})
export class CliModule {}
