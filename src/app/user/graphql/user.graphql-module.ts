import { Module } from '@nestjs/common';

import { UserDatabaseModule } from '../database/user.database-module';
import { UserMutationResolver } from './user.mutation-resolver';
import { UserQueryResolver } from './user.query-resolver';
import { UserQueryService } from './user.query-service';

@Module({
  imports: [UserDatabaseModule],
  providers: [UserQueryResolver, UserMutationResolver, UserQueryService],
})
export class UserGraphqlModule {}
