import { Module } from '@nestjs/common';

import { UserDatabaseModule } from './database/user.database-module';
import { UserGraphqlModule } from './graphql/user.graphql-module';

@Module({
  imports: [UserDatabaseModule, UserGraphqlModule],
})
export class UserModule {}
