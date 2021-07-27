import { Module } from '@nestjs/common';

import { AuthModule } from '../../../common/auth/auth.module';
import { ExceptionsModule } from '../../../common/exceptions/exceptions.module';
import { OneTimeTokensModule } from '../../../common/oneTimeTokens/oneTimeTokens.module';
import { UserModule } from '../../../database/entities/user/user.module';
import { UserSocialModule } from '../../../database/entities/userSocial/userSocial.module';
import { GoogleStrategy } from './googleStrategy.service';
import { OAuthGoogleController } from './oauthGoogle.controller';

@Module({
  imports: [
    UserModule,
    UserSocialModule,
    OneTimeTokensModule,
    AuthModule,
    ExceptionsModule,
  ],
  controllers: [OAuthGoogleController],
  providers: [GoogleStrategy],
})
export class OAuthGoogleModule {}
