import { Module } from '@nestjs/common';

import { AuthCommonModule } from './common/auth.common-module';
import { AuthGraphqlModule } from './graphql/auth.graphql-module';

/**
 * Модуль аутентификации
 */
@Module({
  imports: [AuthCommonModule, AuthGraphqlModule],
  providers: [],
  exports: [],
})
export class AuthModule {}
