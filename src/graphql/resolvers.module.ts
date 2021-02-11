import { Module } from '@nestjs/common';

import { AuthGraphqlModule } from './auth/auth.graphql-module';
import { UserGraphqlModule } from './user/user.graphql-module';

@Module({
  imports: [AuthGraphqlModule, UserGraphqlModule],
})
export class ResolversModule {}
