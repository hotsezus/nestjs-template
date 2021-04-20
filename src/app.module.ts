import { Module } from '@nestjs/common';

import { CommonModule } from './common/common.module';
import { AppGraphqlModule } from './graphql/app.graphql-module';

@Module({
  imports: [CommonModule, AppGraphqlModule],
})
export class AppModule {}
