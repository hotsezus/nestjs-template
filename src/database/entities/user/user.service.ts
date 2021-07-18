import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import {
  UserCreateInput,
  UserUpdateInput,
} from '../../../graphql/user/user.input';
import { applyChanges } from '../../../utils/object';
import { exceptionDuplicateKey } from '../../../utils/sqlErors';
import { User } from './user.entity';
import { UserPasswordsService } from './userPasswords.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userPasswordsService: UserPasswordsService,
  ) {}

  /**
   * Создает пользователя с заданными параметрами
   */
  public async createUser(params: UserCreateInput) {
    try {
      const { password, ...userData } = params;
      const user = new User();

      if (password) {
        await this.userPasswordsService.changeUserPassword(user, password);
      }

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

    if (new_password) {
      await this.userPasswordsService.changeUserPassword(
        existingUser,
        new_password,
      );
    }

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
}
