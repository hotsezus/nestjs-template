import { Module } from '@nestjs/common';

import { UserModule } from '../../database/entities/user/user.module';
import { UserQueries } from './user.queries';

@Module({
  imports: [UserModule],
  providers: [UserQueries],
})
export class UserGraphqlModule {}
