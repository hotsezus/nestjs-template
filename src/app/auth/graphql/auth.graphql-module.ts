import { Module } from '@nestjs/common';

import { UserDatabaseModule } from '../../user/database/user.database-module';
import { UserTokensModule } from '../../userTokens/userTokens.module';
import { AuthCommonModule } from '../common/auth.common-module';
import { AuthMutationResolver } from './auth.mutation-resolver';

@Module({
  imports: [UserDatabaseModule, UserTokensModule, AuthCommonModule],
  providers: [AuthMutationResolver],
})
export class AuthGraphqlModule {}
