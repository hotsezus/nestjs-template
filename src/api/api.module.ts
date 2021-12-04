import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import path from 'path';

import { AuthGraphqlModule } from '../app/auth/graphql/auth.graphql-module';
import { OAuthGraphqlModule } from '../app/oauth/graphql/oauth.graphql-module';
import { OAuthRestModule } from '../app/oauth/rest/oauth.rest-module';
import { UserGraphqlModule } from '../app/user/graphql/user.graphql-module';
import { CommonModule } from '../common/common.module';
import { initialConfig, playgroundConfig } from '../config/graphql';
import { TypeormDataLoaderInterceptor } from '../utils/graphql/dataloaders/TypeormDataLoaderInterceptor';

@Module({
  imports: [
    CommonModule,
    GraphQLModule.forRoot({
      autoSchemaFile: path.join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      ...initialConfig,
      ...playgroundConfig,
    }),
    AuthGraphqlModule,
    UserGraphqlModule,
    OAuthGraphqlModule,
    OAuthRestModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TypeormDataLoaderInterceptor,
    },
  ],
})
export class ApiModule {}
