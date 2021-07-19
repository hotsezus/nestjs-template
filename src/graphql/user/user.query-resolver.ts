import { UseGuards } from '@nestjs/common';
import { Args, ID, Info, Query, Resolver } from '@nestjs/graphql';

import { GraphqlAuthGuard } from '../../common/auth/graphqlAuth.guard';
import { UserQueryService } from '../../database/entities/user/user.query-service';
import { UserService } from '../../database/entities/user/user.service';
import { applyQueryPagination } from '../_utils/pagination/pagination';
import { UserPageInput } from './user.input';
import { UserPageType, UserType } from './user.type';

@UseGuards(GraphqlAuthGuard)
@Resolver()
export class UserQueryResolver {
  constructor(
    private readonly userService: UserService,
    private readonly userQuery: UserQueryService,
  ) {}

  /**
   * Возвращает пользователя по его идентификатору
   */
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

  /**
   * Возвращает список пользователей
   */
  @Query(() => UserPageType, { nullable: true })
  async usersPage(
    @Info() info,
    @Args({
      name: 'input',
      type: () => UserPageInput,
      nullable: true,
    })
    input?: UserPageInput,
  ) {
    const { filter } = input || ({} as UserPageInput);

    const query = this.userQuery.createBaseQuery('users', filter);

    return applyQueryPagination(info, query, input);
  }
}
