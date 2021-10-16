import {
  Get,
  Logger,
  Query,
  Render,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { defaultOptions } from '@nestjs/passport/dist/options';
import { CustomError } from '@proscom/ui-utils';
import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { AllExceptionsFilter } from '../../../common/exceptions/allExceptionsFilter';
import {
  enableOAuthOriginOverride,
  oauthTokenExpiration,
  socialFrontendOrigin,
} from '../../../config/environment';
import { AnyObject } from '../../../utils/object';
import { addWhereInSubquery } from '../../../utils/queryBuilder/builderWhere';
import { AuthService } from '../../auth/common/auth.service';
import {
  OneTimeTokenService,
  OneTimeTokenTypeEnum,
} from '../../ott/common/oneTimeToken.service';
import { UserRolesEnum } from '../../user/common/user.common-fields';
import { User } from '../../user/database/user.entity';
import { UserService } from '../../user/database/user.service';
import {
  SocialProviderEnum,
  UserSocial,
} from '../../userSocial/userSocial.entity';
import { createPassportContext } from './createPassportContext';
import { OneTimeTokenOAuthFlow } from './oauthFlow';
import { OAuthProfile } from './oauthProfile';
import { OneTimeTokenOAuthStart } from './oauthStart';

class DisplayableError extends CustomError {}

class WrappedError extends DisplayableError {
  constructor(message: string, protected readonly originalError: any) {
    super(message);
  }
}

/**
 * Базовый класс для всех OAuth контроллеров
 */
export abstract class OAuthController {
  logger: Logger;

  protected constructor(
    protected readonly social: SocialProviderEnum,
    protected readonly strategy: string,
    protected readonly userRepository: Repository<User>,
    protected readonly userSocialRepository: Repository<UserSocial>,
    protected readonly oneTimeTokenService: OneTimeTokenService,
    protected readonly authService: AuthService,
    protected readonly userService: UserService,
    protected readonly exceptionFilter: AllExceptionsFilter,
  ) {
    this.logger = new Logger(OAuthController.name + social);
  }

  @Get('/')
  async startFlow(
    @Query('token') token: string,
    @Query('origin') origin: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tokenData =
      await this.oneTimeTokenService.consume<OneTimeTokenOAuthStart>(
        token,
        OneTimeTokenTypeEnum.OAUTH_START,
      );

    const state = nanoid(64);
    // Пишем flow токен в cookies для распознавания пользователя при получении редиректа
    const oauthFlowToken =
      await this.oneTimeTokenService.generate<OneTimeTokenOAuthFlow>({
        type: OneTimeTokenTypeEnum.OAUTH_FLOW,
        userId: tokenData?.userId,
        origin: enableOAuthOriginOverride && origin ? origin : undefined,
        state,
      });

    res.cookie('oauth_flow_token', oauthFlowToken, {
      httpOnly: true,
      expires: new Date(Date.now() + oauthTokenExpiration * 1000),
    });

    const options = { state };
    await this.applyPassport(req, res, options);

    res.status(500).send();
  }

  @Get('/redirect')
  @Render('oauthFinish')
  async handleRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const tokenData =
        await this.oneTimeTokenService.consume<OneTimeTokenOAuthFlow>(
          req.cookies.oauth_flow_token,
          OneTimeTokenTypeEnum.OAUTH_FLOW,
        );

      const options = {
        state: tokenData?.state,
      };
      const oauthProfile = await this.applyPassport(req, res, options);

      if (!oauthProfile) {
        throw new DisplayableError('Ошибка OAuth');
      }

      let user;

      if (tokenData?.userId) {
        // Если в токене есть userId, значит пользователь существует и это попытка привязки стороннего профиля к пользователю системы
        user = await this.userRepository.findOne({
          id: tokenData?.userId,
        });
      } else {
        // Если userId нет, значит нужно попробовать найти его по id или email пользователя стороннего сервиса
        user = await this.findUser(oauthProfile);
      }

      if (!user) {
        try {
          user = await this.createUser(oauthProfile);
        } catch (e) {
          throw new WrappedError('Ошибка создания учетной записи', e);
        }
      }

      let userSocial = await this.userSocialRepository.findOne({
        social_id: oauthProfile.socialId,
        social: this.social,
      });

      if (userSocial) {
        if (userSocial.user_id !== user.id) {
          throw new DisplayableError(
            'Учетная запись принадлежит другому аккаунту',
          );
        }
      } else {
        userSocial = this.userSocialRepository.create({
          social_id: oauthProfile.socialId,
          user_id: user.id,
          social: this.social,
        });

        await this.userSocialRepository.save(userSocial);
      }

      const refreshToken = await this.authService.createRefreshToken(user);

      const origin = tokenData?.origin || socialFrontendOrigin;

      return {
        message: JSON.stringify({
          type: 'refreshToken',
          body: JSON.stringify({
            token: refreshToken,
          }),
        }),
        origin: JSON.stringify(origin),
      };
    } catch (e) {
      const { errorId } = this.exceptionFilter.processException(e);
      if (e instanceof DisplayableError) {
        return { error: true, errorInfo: e.message, errorId };
      } else {
        return { error: true, errorId };
      }
    }
  }

  async applyPassport(req: Request, res: Response, options: AnyObject) {
    const passportFn = createPassportContext(req, res);
    const _options = {
      ...defaultOptions,
      property: 'oauth',
      ...options,
    };
    const result = await passportFn(
      this.strategy,
      _options,
      (err, user, info) => {
        if (err || !user) {
          throw err || new UnauthorizedException();
        }
        return user;
      },
    );
    return result as OAuthProfile;
  }

  async findUser(oauthProfile: any) {
    const socialUser = await this._getSocialUser(oauthProfile.socialId);
    if (socialUser) return socialUser;

    // В некоторых проектах может быть корректно разрешить сопоставление
    // пользователей по электронной почте.
    // Для этого необходимо убедиться, что провайдер полностью гарантирует
    // что электронная почта подтверждена и действительно аккаунт пользователя
    // в провайдере находится под управлением того же пользователя, что и электронная почта.
    // Обычно соцсети не дают такой гарантии, а внутренние провайдеры - дают.
    //
    // if (oauthProfile.email) {
    //   const query = this.userRepository
    //     .createQueryBuilder('user')
    //     .where('user.email = :email', {
    //       email: oauthProfile.email,
    //     });
    //
    //   return await query.getOne();
    // }

    return undefined;
  }

  async createUser(oauthProfile: any) {
    // Если пользователь так и не нашелся, создаем его с помощью email пользователя стороннего сервиса
    const user = await this.userService.createUser({
      name: oauthProfile.firstName,
      email: oauthProfile.email,
      role: UserRolesEnum.DEFAULT,
    });
    return user;
  }

  _getSocialUserQuery(socialId: number | string) {
    return this.userSocialRepository
      .createQueryBuilder('user_social')
      .select('distinct user_id')
      .where('user_social.social = :network_id', {
        network_id: this.social,
      })
      .andWhere('user_social.social_id = :social_id', {
        social_id: socialId,
      });
  }

  async _getSocialUser(socialId: number | string) {
    const subquery = this._getSocialUserQuery(socialId);
    const query = this.userRepository.createQueryBuilder('user');
    addWhereInSubquery(query, 'user.id', subquery);
    return query.getOne();
  }
}
