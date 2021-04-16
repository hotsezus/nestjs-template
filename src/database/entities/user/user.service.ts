import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { addSeconds, differenceInSeconds } from 'date-fns';
import { nanoid } from 'nanoid/async';
import { MoreThan, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import {
  refreshExpiration,
  refreshTokenLength,
  refreshTokenReuseTimeout,
  saltRounds,
} from '../../../config/jwt';
import {
  UserCreateInput,
  UserUpdateInput,
} from '../../../graphql/user/user.type';
import { exceptionDuplicateKey } from '../../../utils/exceptions';
import { applyChanges } from '../../../utils/objects';
import { User } from './user.entity';
import { UserAuthPassword } from './userAuthPassword.entity';
import { UserAuthToken } from './userAuthToken.entity';
import { TokenType } from './userAuthTokenFields';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserAuthPassword)
    private readonly userAuthPasswordRepo: Repository<UserAuthPassword>,
    @InjectRepository(UserAuthToken)
    private readonly userAuthTokenRepo: Repository<UserAuthToken>,
  ) {}

  /**
   * Создает пользователя с заданными параметрами
   */
  public async createUser(params: UserCreateInput) {
    try {
      const { password, ...userData } = params;
      const user = new User();

      await this.changeUserPassword(user, password);

      applyChanges(user, userData);
      return this.userRepo.save(user);
    } catch (e) {
      exceptionDuplicateKey(e);
      throw e;
    }
  }

  public async updateUser(params: UserUpdateInput) {
    const existingUser = await this.getById(params.id);

    if (!existingUser) {
      throw new NotFoundException();
    }

    const { new_password, ...userParams } = params;

    await this.changeUserPassword(existingUser, new_password);

    applyChanges(existingUser, userParams);

    try {
      return await this.userRepo.save(existingUser);
    } catch (e) {
      exceptionDuplicateKey(e);
      throw e;
    }
  }

  async deleteUser(id: number): Promise<DeleteResult> {
    const target = await this.userRepo.findOne({ id });

    if (!target) {
      throw new NotFoundException();
    }

    return this.userRepo.delete({ id });
  }

  /**
   * Возвращает пользователя по идентификатору
   */
  public async getById(id: number) {
    return await this.userRepo
      .createQueryBuilder('user')
      .andWhere('user.id = :id', { id })
      .getOne();
  }

  /**
   * Возвращает пользователя по почте
   */
  public async getByEmailOrLogin(emailOrLogin: string) {
    return this.userRepo.findOne({
      where: [{ email: emailOrLogin }, { login: emailOrLogin }],
    });
  }

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
   * Сохраняет/перезаписывает хеш пользовательского пароля
   */
  public async changeUserPassword(user: User, password: string) {
    // Удалить старый пароль
    await this.userAuthPasswordRepo
      .createQueryBuilder()
      .delete()
      .where('user_id = :user_id', { user_id: user.id })
      .execute();

    const userPassword = new UserAuthPassword();
    userPassword.user = user;
    userPassword.hash = await this.hashPassword(password);
    return this.userAuthPasswordRepo.save(userPassword);
  }

  /**
   * Проверяет почту и пароль пользователя и возвращает подходящего
   * пользователя в случае успеха. В случае ошибки поднимается исключение
   */
  public async checkUserCredentials(emailOrLogin: string, password: string) {
    const userAuthPassword = await this.userAuthPasswordRepo
      .createQueryBuilder('uap')
      .innerJoinAndSelect('uap.user', 'u')
      .where('LOWER(u.email) = :email', { email: emailOrLogin.toLowerCase() })
      .orWhere('u.login = :login', { login: emailOrLogin })
      .getOne();
    if (!userAuthPassword) {
      throw new UnauthorizedException(`Provided credentials were invalid`);
    }

    const result = await this.checkPassword(password, userAuthPassword.hash);
    if (!result) {
      throw new UnauthorizedException(`Provided credentials were invalid`);
    }

    return userAuthPassword.user;
  }

  /**
   * Использует долгосрочный токен доступа для аутентификации пользователя
   */
  public async useAuthToken(token: string) {
    const userAuthToken = await this.findAuthToken(token);

    const now = new Date();
    if (
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

  /**
   * Возвращает хеш пароля
   */
  public async hashPassword(password: string) {
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Проверяет, что пароль соотносится с хешом
   */
  public async checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
