import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { cleanObject } from '@proscom/ui-utils';

import { JwtAccessPayload } from '../../../config/jwt';
import { User } from '../../user/database/user.entity';
import { UserService } from '../../user/database/user.service';
import { UserTokensService } from '../../userTokens/userTokens.service';

/**
 * Сервис аутентификации
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly userTokensService: UserTokensService,
  ) {}

  /**
   * Получает пользователя из проверенного jwt-токена
   */
  async getUserFromJwtPayload(payload: JwtAccessPayload) {
    const user = await this.userService.getById(payload.id);
    return this.requireUser(user);
  }

  /**
   * Выбрасывает ошибку авторизации, если передано пустое значение
   */
  async requireUser(user?: User) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  /**
   * Создает access-токен для пользователя
   */
  async createAccessToken(user: User, ttl?: number | string) {
    const payload: JwtAccessPayload = {
      id: user.id,
    };

    return this.jwtService.sign(payload, cleanObject({ expiresIn: ttl }));
  }

  /**
   * Создает refresh-токен для пользователя
   */
  async createRefreshToken(user: User) {
    return this.userTokensService.createUserRefreshToken(user);
  }

  async generateTokens(user: User) {
    return Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);
  }

  async generateResponse(user: User) {
    const [accessToken, refreshToken] = await this.generateTokens(user);
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
