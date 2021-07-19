import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { applyChanges } from '../../../utils/object';
import { exceptionDuplicateKey } from '../../../utils/sqlErors';
import { UserCommonFields } from './user.common-fields';
import { User } from './user.entity';
import { UserPasswordsService } from './userPasswords.service';

export class UserCreateArgs extends UserCommonFields {
  password: string;
}

export class UserUpdateArgs extends UserCommonFields {
  id: number;
  new_password?: string;
}

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
  public async createUser(params: UserCreateArgs) {
    try {
      const { password, ...userData } = params;
      const user = new User();

      applyChanges(user, userData);
      const result = await this.userRepo.save(user);

      if (password) {
        await this.userPasswordsService.changeUserPassword(result, password);
      }

      return result;
    } catch (e) {
      exceptionDuplicateKey(e);
      throw e;
    }
  }

  public async updateUser(params: UserUpdateArgs) {
    const existingUser = await this.getById(params.id);

    if (!existingUser) {
      throw new NotFoundException();
    }

    const { new_password, ...userParams } = params;

    applyChanges(existingUser, userParams);

    const result = await (async () => {
      try {
        return await this.userRepo.save(existingUser);
      } catch (e) {
        exceptionDuplicateKey(e);
        throw e;
      }
    })();

    if (new_password) {
      await this.userPasswordsService.changeUserPassword(result, new_password);
    }

    return result;
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
