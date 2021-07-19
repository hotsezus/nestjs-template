import { Module } from '@nestjs/common';

import { AuthModule } from '../../common/auth/auth.module';
import { OneTimeTokenMutationResolver } from './oneTimeToken.mutation-resolver';

@Module({
  imports: [AuthModule],
  providers: [OneTimeTokenMutationResolver],
})
export class OauthGraphqlModule {}
