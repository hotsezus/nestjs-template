import { Module } from '@nestjs/common';
import { isTruthy } from '@proscom/ui-utils';

import { booleanEnv } from '../../config/tools';
import { OAuthGoogleModule } from './google/oauthGoogle.module';

const OAUTH_GOOGLE_ENABLE = booleanEnv(process.env.OAUTH_GOOGLE_ENABLE);

@Module({
  imports: [OAUTH_GOOGLE_ENABLE && OAuthGoogleModule].filter(isTruthy),
})
export class OAuthModule {}
