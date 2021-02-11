import { Module } from '@nestjs/common';

import { AuthModule } from '../../common/auth/auth.module';
import { UserModule } from '../../database/entities/user/user.module';
import { LoginResolver } from './login.resolver';

@Module({
  imports: [AuthModule, UserModule],
  providers: [LoginResolver],
})
export class AuthGraphqlModule {}
