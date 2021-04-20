import { Module } from '@nestjs/common';

import { UserModule } from '../../database/entities/user/user.module';
import { UserMutationResolver } from './user.mutation-resolver';
import { UserQueryResolver } from './user.query-resolver';

@Module({
  imports: [UserModule],
  providers: [UserQueryResolver, UserMutationResolver],
})
export class UserGraphqlModule {}
