import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UserQueryService } from './user.query-service';
import { UserService } from './user.service';
import { UserAuthPassword } from './userAuthPassword.entity';
import { UserPasswordsService } from './userPasswords.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAuthPassword])],
  providers: [UserService, UserQueryService, UserPasswordsService],
  exports: [TypeOrmModule, UserService, UserQueryService, UserPasswordsService],
})
export class UserModule {}
