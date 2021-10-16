import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtAccessPayload, jwtSecretKey } from '../../../config/jwt';
import { AuthService } from './auth.service';

export const STRATEGY_JWT = 'jwt';

/**
 * Стратегия проверки аутентификации с помощью jwt-токена в
 * http заголовке Authorization Bearer
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, STRATEGY_JWT) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecretKey,
    });
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Переопределенная функция, которая вызывается когда токен уже проверен
   * Она возвращает пользователя исходя из содержимого токена
   */
  async validate(payload: JwtAccessPayload) {
    return this.authService.getUserFromJwtPayload(payload);
  }
}
