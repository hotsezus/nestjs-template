import { Module } from '@nestjs/common';

import { CommonModule } from './common/common.module';
import { AppGraphqlModule } from './graphql/app.graphql-module';
import { RestModule } from './rest/rest.module';

@Module({
  imports: [CommonModule, AppGraphqlModule, RestModule],
})
export class ApiModule {}
