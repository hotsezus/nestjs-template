import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid/async';
import { Command, Option } from 'nestjs-command';
import { Repository } from 'typeorm';

import { parseNull } from '../../_utils/string';
import { UserRolesEnum } from '../../app/user/common/user.common-fields';
import { User } from '../../app/user/database/user.entity';
import { UserService } from '../../app/user/database/user.service';
import { UserPasswordsService } from '../../app/user/database/userPasswords.service';

const rolesArray = Object.keys(UserRolesEnum).map((key) => {
  return UserRolesEnum[key];
});

@Injectable()
export class UserCommand {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly userService: UserService,
    private readonly userPasswords: UserPasswordsService,
  ) {}

  @Command({
    command: 'user:create',
    describe: 'Creates new user',
  })
  async userCreate(
    @Option({
      name: 'email',
      type: 'string',
    })
    email: string,
    @Option({
      name: 'name',
      type: 'string',
      describe: 'Имя',
    })
    name: string,
    @Option({
      name: 'password',
      type: 'string',
    })
    password: string,
    @Option({
      name: 'passwordLength',
      type: 'number',
      description: 'Длина автогенерируемого пароля',
    })
    passwordLength: number,
    @Option({
      name: 'role_code',
      type: 'string',
      choices: rolesArray,
    })
    role_code: UserRolesEnum,
  ) {
    if (!password && !passwordLength) {
      console.log('Either password or passwordLength is required');
      return 1;
    }

    if (passwordLength) {
      password = await nanoid(passwordLength);
    }

    const user = await this.userService.createUser({
      email,
      name,
      // role: role_code,
      password,
    });

    if (passwordLength) {
      console.log(`User with id=${user.id} and password="${password}" created`);
    } else {
      console.log(`User with id=${user.id} created`);
    }
  }

  @Command({
    command: 'user:update',
    describe: 'Updates user data',
  })
  async userUpdate(
    @Option({
      name: 'id',
      type: 'number',
    })
    id: number,
    @Option({
      name: 'login',
      type: 'string',
    })
    login: string,
    @Option({
      name: 'email',
      type: 'string',
    })
    email: string,
    @Option({
      name: 'name',
      type: 'string',
      describe: 'ФИО',
    })
    name: string,
    @Option({
      name: 'password',
      type: 'string',
    })
    password: string,
    @Option({
      name: 'passwordLength',
      type: 'number',
      description: 'Длина автогенерируемого пароля',
    })
    passwordLength: number,
    @Option({
      name: 'role_code',
      type: 'string',
      choices: rolesArray,
    })
    role_code: UserRolesEnum,
  ) {
    const findCondition = id
      ? { id }
      : email
      ? { email }
      : login
      ? { login }
      : null;
    if (!findCondition) {
      console.log(
        'Please specify either id, email or login to update the user',
      );
      return 1;
    }

    const user = await this.usersRepo.findOne({
      where: findCondition,
    });

    if (!user) {
      console.log(`User not found`);
      return 1;
    }

    if (id) {
      if (login) {
        user.login = parseNull(login);
      }
      if (email) {
        user.email = parseNull(email);
      }
    }

    if (name) {
      user.name = parseNull(name);
    }

    if (role_code) {
      user.role = parseNull(role_code);
    }

    if (passwordLength) {
      password = await nanoid(passwordLength);
    }

    if (password) {
      await this.userPasswords.changeUserPassword(user, password + '');
    }

    await this.usersRepo.save(user);

    if (passwordLength) {
      console.log(`User with id=${user.id} and password="${password}" updated`);
    } else {
      console.log(`User with id=${user.id} updated`);
    }
  }
}
