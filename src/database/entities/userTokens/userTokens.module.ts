import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { UserAuthToken } from './userAuthToken.entity';
import { UserTokensService } from './userTokens.service';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([UserAuthToken])],
  providers: [UserTokensService],
  exports: [TypeOrmModule, UserTokensService],
})
export class UserTokensModule {}
