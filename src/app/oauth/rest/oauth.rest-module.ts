import { Module } from '@nestjs/common';

import { ExceptionsModule } from '../../../common/exceptions/exceptions.module';
import { AuthCommonModule } from '../../auth/common/auth.common-module';
import { OneTimeTokenCommonModule } from '../../ott/common/oneTimeToken.common-module';
import { OneTimeTokenModule } from '../../ott/oneTimeToken.module';
import { UserDatabaseModule } from '../../user/database/user.database-module';
import { UserSocialModule } from '../../userSocial/userSocial.module';
import { GoogleStrategy } from './googleStrategy.service';
import { OAuthGoogleController } from './oauthGoogle.controller';

@Module({
  imports: [
    OneTimeTokenModule,
    ExceptionsModule,
    AuthCommonModule,
    UserDatabaseModule,
    UserSocialModule,
    OneTimeTokenCommonModule,
  ],
  controllers: [OAuthGoogleController],
  providers: [GoogleStrategy],
})
export class OAuthRestModule {}
