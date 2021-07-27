import { Controller, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthService } from '../../../common/auth/auth.service';
import { AllExceptionsFilter } from '../../../common/exceptions/allExceptionsFilter';
import { OneTimeTokenService } from '../../../common/oneTimeTokens/oneTimeToken.service';
import { User } from '../../../database/entities/user/user.entity';
import { UserService } from '../../../database/entities/user/user.service';
import {
  SocialProviderEnum,
  UserSocial,
} from '../../../database/entities/userSocial/userSocial.entity';
import { OAuthController } from '../common/oauth.controller';
import { PASSPORT_STRATEGY_GOOGLE } from './googleStrategy.service';

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
