import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import path from 'path';

import { initialConfig, playgroundConfig } from './graphql.config';
import { ResolversModule } from './resolvers.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: path.join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      ...initialConfig,
      ...playgroundConfig,
    }),
    ResolversModule,
  ],
  providers: [],
})
export class AppGraphqlModule {}
