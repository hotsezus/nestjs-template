import { Controller, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AllExceptionsFilter } from '../../../common/exceptions/allExceptionsFilter';
import { AuthService } from '../../auth/common/auth.service';
import { OneTimeTokenService } from '../../ott/common/oneTimeToken.service';
import { User } from '../../user/database/user.entity';
import { UserService } from '../../user/database/user.service';
import {
  SocialProviderEnum,
  UserSocial,
} from '../../userSocial/userSocial.entity';
import { PASSPORT_STRATEGY_GOOGLE } from './googleStrategy.service';
import { OAuthController } from './oauth.controller';

/**
 * Контроллер, реализующий маршруты для входа через Google с использованием OAuth
 */
@Controller(`/auth/${SocialProviderEnum.GOOGLE.toLowerCase()}`)
export class OAuthGoogleController extends OAuthController {
  logger = new Logger(OAuthGoogleController.name);

  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    @InjectRepository(UserSocial)
    userSocialRepository: Repository<UserSocial>,
    oneTimeTokenService: OneTimeTokenService,
    authService: AuthService,
    userService: UserService,
    exceptionFilter: AllExceptionsFilter,
  ) {
    super(
      SocialProviderEnum.GOOGLE,
      PASSPORT_STRATEGY_GOOGLE,
      userRepository,
      userSocialRepository,
      oneTimeTokenService,
      authService,
      userService,
      exceptionFilter,
    );
  }
}
