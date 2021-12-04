import { Field, ID, InputType } from '@nestjs/graphql';

import { PageInput } from '../../../utils/graphql/pagination/page.input';
import { UserEditableFields } from '../common/user.editable-fields';
import { IUserFilter } from './user.query-service';

@InputType()
export class UserCreateInput extends UserEditableFields {
  password: string;
}

@InputType()
export class UserUpdateInput extends UserEditableFields {
  @Field((type) => ID)
  id: number;

  @Field(() => String, { nullable: true })
  new_password: string | undefined;
}

@InputType()
export class UserFilter implements IUserFilter {
  /**
   * ID пользователей
   */
  @Field(() => [ID], { nullable: true })
  ids: number[] | undefined;

  /**
   * ID пользователей, исключенных из выборки
   */
  @Field(() => [ID], { nullable: true })
  exclude_ids: number[] | undefined;

  /**
   * Текстовый поиск по полям 'login', 'email', 'name' пользователя
   */
  @Field(() => String, { nullable: true })
  search: string | undefined;

  /**
   * ID создателей
   */
  @Field(() => [ID], { nullable: true })
  creator_user_ids: number[] | undefined;
}

@InputType()
export class UserPageInput extends PageInput(UserFilter) {}
