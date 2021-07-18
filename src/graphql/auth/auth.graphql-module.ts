import { Module } from '@nestjs/common';

import { AuthModule } from '../../common/auth/auth.module';
import { UserModule } from '../../database/entities/user/user.module';
import { UserTokensModule } from '../../database/entities/userTokens/userTokens.module';
import { AuthMutationResolver } from './auth.mutation-resolver';

@Module({
  imports: [AuthModule, UserModule, UserTokensModule],
  providers: [AuthMutationResolver],
})
export class AuthGraphqlModule {}
