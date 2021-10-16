import { Inject, Injectable } from '@nestjs/common';
import { isTruthy, tryParseJson } from '@proscom/ui-utils';
import { nanoid } from 'nanoid/async';
import { REDIS_CLIENT, RedisClient } from 'nest-module-redis';
import { DeepPartial } from 'typeorm';

import { AnyObject } from '../../../_utils/object';
import {
  oauthTokenExpiration,
  oneTimeTokenExpiration,
} from '../../../config/environment';

export enum OneTimeTokenTypeEnum {
  OAUTH_START = 'OAUTH_START',
  OAUTH_FLOW = 'OAUTH_FLOW',
}

export interface OneTimeTokenPayload {
  type: OneTimeTokenTypeEnum;
}

@Injectable()
export class OneTimeTokenService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClient,
  ) {}

  async generate<T extends AnyObject>(data: T, expiration?: number) {
    const token = `${data.type.toLowerCase()}::${await nanoid(32)}`;
    await this.redisClient.set(
      token,
      JSON.stringify(data),
      'EX',
      expiration || this.getExpiration(data.type),
    );
    return token;
  }

  async consume<T extends OneTimeTokenPayload>(
    token: string | undefined,
    type: OneTimeTokenTypeEnum,
  ): Promise<undefined | DeepPartial<T>> {
    if (!token) return undefined;
    const upayload = tryParseJson(await this.redisClient.get(token));
    if (typeof upayload !== 'object' || !isTruthy(upayload)) return undefined;
    const payload = upayload as DeepPartial<T>;
    if (payload.type !== type) return undefined;
    await this.redisClient.del(token);
    return payload;
  }

  /**
   * Определяет времени жизни токена по его типу
   * @param type - тип токена
   */
  getExpiration(type: OneTimeTokenTypeEnum) {
    // При добавлении токенов новых типов нужно просто добавить новый `case` в `switch`
    switch (type) {
      case OneTimeTokenTypeEnum.OAUTH_FLOW:
        return oauthTokenExpiration;
      default:
        return oneTimeTokenExpiration;
    }
  }
}
