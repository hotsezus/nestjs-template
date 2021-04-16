import { Module } from '@nestjs/common';

import { CliCommandsModule } from './cli/cliCommands.module';
import { SystemModule } from './system/system.module';

@Module({
  imports: [SystemModule, CliCommandsModule],
})
export class CliModule {}
