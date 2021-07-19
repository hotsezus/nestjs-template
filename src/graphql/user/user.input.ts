import { Field, ID, InputType } from '@nestjs/graphql';

import { UserCommonFields } from '../../database/entities/user/user.common-fields';
import { IUserFilter } from '../../database/entities/user/user.query-service';
import { IdsField } from '../_utils/decorators';
import { PageInput } from '../_utils/pagination/page.input';

@InputType()
export class UserCreateInput extends UserCommonFields {
  password: string;
}

@InputType()
export class UserUpdateInput extends UserCommonFields {
  @Field((type) => ID)
  id: number;

  new_password?: string;
}

@InputType()
export class UserFilter implements IUserFilter {
  /**
   * ID пользователей
   */
  @IdsField()
  ids?: number[];

  /**
   * ID пользователей, исключенных из выборки
   */
  @IdsField()
  exclude_ids?: number[] | null;

  /**
   * Текстовый поиск по полям 'login', 'email', 'name' пользователя
   */
  @Field()
  search?: string;

  /**
   * ID создателей
   */
  @IdsField()
  creator_user_ids?: number[];
}

@InputType()
export class UserPageInput extends PageInput(UserFilter) {}
