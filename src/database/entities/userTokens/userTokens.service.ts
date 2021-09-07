import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addSeconds, differenceInSeconds } from 'date-fns';
import { nanoid } from 'nanoid/async';
import { MoreThan, Repository } from 'typeorm';

import {
  refreshExpiration,
  refreshTokenLength,
  refreshTokenReuseTimeout,
} from '../../../config/jwt';
import { User } from '../user/user.entity';
import { UserAuthToken } from './userAuthToken.entity';
import { TokenType } from './userAuthToken.fields';

@Injectable()
export class UserTokensService {
  constructor(
    @InjectRepository(UserAuthToken)
    private readonly userAuthTokenRepo: Repository<UserAuthToken>,
  ) {}

  /**
   * Создает долгосрочный токен доступа
   */
  public async createUserRefreshToken(
    user: User,
    expiration = refreshExpiration,
  ) {
    const userToken = new UserAuthToken();
    userToken.type = TokenType.REFRESH;
    userToken.user = user;
    userToken.token = await nanoid(refreshTokenLength);
    userToken.expires_at = addSeconds(new Date(), expiration);
    return this.userAuthTokenRepo.save(userToken);
  }

  /**
   * Удаляет старые токены из базы данных
   */
  public async removeOldTokens() {
    const result = await this.userAuthTokenRepo
      .createQueryBuilder()
      .delete()
      .where('(expires_at is null or expires_at < :now)', { now: new Date() })
      .execute();
    return result.raw[1] || 0;
  }

  /**
   * Использует долгосрочный токен доступа для аутентификации пользователя
   */
  public async useAuthToken(token: string) {
    const userAuthToken = await this.findAuthToken(token);

    const now = new Date();
    if (
      userAuthToken.expires_at &&
      differenceInSeconds(userAuthToken.expires_at, now) >
        refreshTokenReuseTimeout
    ) {
      userAuthToken.expires_at = addSeconds(now, refreshTokenReuseTimeout);
      await this.userAuthTokenRepo.save(userAuthToken);
    }

    return userAuthToken.user;
  }

  public async findAuthToken(token: string) {
    const userAuthToken = await this.userAuthTokenRepo.findOne({
      where: {
        token,
        expires_at: MoreThan(new Date()),
      },
    });

    if (!userAuthToken || !userAuthToken.user) {
      throw new UnauthorizedException(`Provided token was invalid`);
    }

    return userAuthToken;
  }
}
