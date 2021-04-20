import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';

import { GraphqlAuthGuard } from '../../common/auth/graphqlAuth.guard';
import { UserService } from '../../database/entities/user/user.service';
import { UserType } from './user.type';

@UseGuards(GraphqlAuthGuard)
@Resolver()
export class UserQueryResolver {
  constructor(private readonly userService: UserService) {}

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
}
