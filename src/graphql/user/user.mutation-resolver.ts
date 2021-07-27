import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';

import { GraphqlAuthGuard } from '../../common/auth/graphqlAuth.guard';
import { UserService } from '../../database/entities/user/user.service';
import { UserCreateInput, UserUpdateInput } from './user.input';
import { UserType } from './user.type';

@UseGuards(GraphqlAuthGuard)
@Resolver()
export class UserMutationResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * Создаёт нового пользователя
   */
  @Mutation(() => UserType)
  async createUser(
    @Args({
      name: 'input',
      type: () => UserCreateInput,
    })
    input: UserCreateInput,
  ): Promise<UserType> {
    return this.userService.createUser(input);
  }

  /**
   * Обновляет пользователя
   */
  @Mutation(() => UserType)
  async updateUser(
    @Args({
      name: 'input',
      type: () => UserUpdateInput,
    })
    input: UserUpdateInput,
  ): Promise<UserType> {
    return this.userService.updateUser(input);
  }

  /**
   * Удаляет пользователя
   */
  @Mutation(() => Boolean)
  async deleteUser(
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<boolean> {
    return !!(await this.userService.deleteUser(id)).affected;
  }
}
