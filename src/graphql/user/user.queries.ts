import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GraphqlAuthGuard } from '../../common/auth/graphqlAuth.guard';
import { User } from '../../database/entities/user/user.entity';
import { UserService } from '../../database/entities/user/user.service';
import { UserCreateInput, UserType, UserUpdateInput } from './user.type';

@UseGuards(GraphqlAuthGuard)
@Resolver()
export class UserQueries {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly userService: UserService,
  ) {}

  @Query(() => UserType, { nullable: true })
  async user(
    @Args({
      name: 'id',
      type: () => ID,
    })
    id: number,
  ) {
    return this.userService.getById(id);
  }

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

  @Mutation(() => Boolean)
  async deleteUser(
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<boolean> {
    return !!(await this.userService.deleteUser(id)).affected;
  }
}
