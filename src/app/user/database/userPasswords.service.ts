import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { saltRounds } from '../../../config/jwt';
import { User } from './user.entity';
import { UserAuthPassword } from './userAuthPassword.entity';

@Injectable()
export class UserPasswordsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserAuthPassword)
    private readonly userAuthPasswordRepo: Repository<UserAuthPassword>,
  ) {}

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
   * Проверяет почту/логин и пароль пользователя и возвращает подходящего
   * пользователя в случае успеха. В случае ошибки поднимается исключение,
   * которое интерпретируется как HTTP-ошибка 401
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
