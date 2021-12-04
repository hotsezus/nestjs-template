import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserDatabaseModule } from '../user/database/user.database-module';
import { UserAuthToken } from './userAuthToken.entity';
import { UserTokensService } from './userTokens.service';

@Module({
  imports: [UserDatabaseModule, TypeOrmModule.forFeature([UserAuthToken])],
  providers: [UserTokensService],
  exports: [TypeOrmModule, UserTokensService],
})
export class UserTokensModule {}
