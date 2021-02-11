import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UserService } from './user.service';
import { UserAuthPassword } from './userAuthPassword.entity';
import { UserAuthToken } from './userAuthToken.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAuthPassword, UserAuthToken])],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
