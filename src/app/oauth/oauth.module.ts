import { Module } from '@nestjs/common';

import { OneTimeTokenModule } from '../ott/oneTimeToken.module';
import { OAuthGraphqlModule } from './graphql/oauth.graphql-module';
import { OAuthRestModule } from './rest/oauth.rest-module';

@Module({
  imports: [OAuthGraphqlModule, OAuthRestModule, OneTimeTokenModule],
})
export class OAuthModule {}
