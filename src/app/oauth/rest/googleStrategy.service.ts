import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import { OAuthProfile } from './oauthProfile';

export const PASSPORT_STRATEGY_GOOGLE = 'google';

/**
 * Обёртка над OAuth стратегией для passport для входа через Google.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_GOOGLE,
) {
  constructor() {
    // Передаём конкретные параметры стратегии для нашего приложения
    super({
      passReqToCallback: true,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_BASE_URL,
      scope: ['email', 'profile', 'openid'],
    });
  }

  /**
   * Дополнительные параметры, передаваемые в Google
   */
  authorizationParams(): { [key: string]: string } {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }

  /**
   * Метод, преобразующий ответ от Google в универсальный интерфейс
   * OauthProfile
   *
   * @param request - отправленный запрос
   * @param accessToken - токен доступа (краткосрочный)
   * @param refreshToken - рефреш-токен (долгосрочный)
   * @param profile - информация, переданная из Google
   */
  async validate(
    request,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<OAuthProfile> {
    const { id, name, emails, photos } = profile;
    const user: OAuthProfile = {
      socialId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };
    return user;
  }
}
