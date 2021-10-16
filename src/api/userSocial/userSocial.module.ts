import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserDatabaseModule } from '../user/database/user.database-module';
import { UserSocial } from './userSocial.entity';

@Module({
  imports: [UserDatabaseModule, TypeOrmModule.forFeature([UserSocial])],
  exports: [TypeOrmModule],
})
export class UserSocialModule {}
