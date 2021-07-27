import { Module } from '@nestjs/common';

import { OAuthModule } from './oauth/oauth.module';

@Module({
  imports: [OAuthModule],
})
export class RestModule {}
