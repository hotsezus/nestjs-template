import { Module } from '@nestjs/common';

import { ExceptionsModule } from '../../../common/exceptions/exceptions.module';
import { AuthCommonModule } from '../../auth/common/auth.common-module';
import { OneTimeTokenCommonModule } from '../../ott/common/oneTimeToken.common-module';
import { UserDatabaseModule } from '../../user/database/user.database-module';
import { UserSocialModule } from '../../userSocial/userSocial.module';
import { GoogleStrategy } from './googleStrategy.service';
import { OAuthGoogleController } from './oauthGoogle.controller';

@Module({
  imports: [
    AuthCommonModule,
    OneTimeTokenCommonModule,
    ExceptionsModule,
    UserDatabaseModule,
    UserSocialModule,
  ],
  controllers: [OAuthGoogleController],
  providers: [GoogleStrategy],
})
export class OAuthRestModule {}
