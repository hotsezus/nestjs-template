import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { applyChanges } from '../../../_utils/object';
import { tryCatchSqlErrors } from '../../../_utils/sqlErrors';
import { UserCommonFields } from '../common/user.common-fields';
import { User } from './user.entity';
import { UserPasswordsService } from './userPasswords.service';

export class UserCreateArgs extends UserCommonFields {
  password?: string;
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
    const { password, ...userData } = params;
    const user = new User();

    applyChanges(user, userData);
    const result = await tryCatchSqlErrors(() => {
      return this.userRepo.save(user);
    });

    if (password) {
      await this.userPasswordsService.changeUserPassword(result, password);
    }

    return result;
  }

  public async updateUser(params: UserUpdateArgs) {
    const existingUser = await this.getById(params.id);

    if (!existingUser) {
      throw new NotFoundException();
    }

    const { new_password, ...userParams } = params;

    applyChanges(existingUser, userParams);

    const result = await tryCatchSqlErrors(() => {
      return this.userRepo.save(existingUser);
    });

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
