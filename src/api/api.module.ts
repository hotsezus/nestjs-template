import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import path from 'path';

import { CommonModule } from '../common/common.module';
import { initialConfig, playgroundConfig } from '../config/graphql';
import { TypeormDataLoaderInterceptor } from '../utils/graphql/typeormDataLoader';
import { AuthModule } from './auth/auth.module';
import { OAuthModule } from './oauth/oauth.module';
import { OneTimeTokenModule } from './ott/oneTimeToken.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    CommonModule,
    GraphQLModule.forRoot({
      autoSchemaFile: path.join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      ...initialConfig,
      ...playgroundConfig,
    }),
    AuthModule,
    UserModule,
    OAuthModule,
    OneTimeTokenModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TypeormDataLoaderInterceptor,
    },
  ],
})
export class ApiModule {}
