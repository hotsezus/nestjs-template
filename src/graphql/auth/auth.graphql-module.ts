import { Module } from '@nestjs/common';

import { AuthModule } from '../../common/auth/auth.module';
import { UserModule } from '../../database/entities/user/user.module';
import { AuthMutationResolver } from './auth.mutation-resolver';

@Module({
  imports: [AuthModule, UserModule],
  providers: [AuthMutationResolver],
})
export class AuthGraphqlModule {}
