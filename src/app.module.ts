import { Module } from '@nestjs/common';

import { AppGraphqlModule } from './graphql/app.graphql-module';
import { SystemModule } from './system/system.module';

@Module({
  imports: [SystemModule, AppGraphqlModule],
})
export class AppModule {}
