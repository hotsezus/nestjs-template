import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { UserSocial } from './userSocial.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([UserSocial])],
  exports: [TypeOrmModule],
})
export class UserSocialModule {}
