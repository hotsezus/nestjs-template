import { UseGuards } from '@nestjs/common';
import { Args, ID, Info, Query, Resolver } from '@nestjs/graphql';

import { applyQueryPagination } from '../../../utils/graphql/pagination/pagination';
import { GraphqlAuthGuard } from '../../auth/_guards/graphqlAuth.guard';
import { UserService } from '../database/user.service';
import { UserPageInput } from './user.input';
import { UserQueryService } from './user.query-service';
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
