import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

import { UserCommonFields } from '../../database/entities/user/entity/user.common-fields';
import { UserFields } from '../../database/entities/user/entity/user.fields';

@ObjectType()
export class UserType extends UserFields {}

@InputType()
export class UserCreateInput extends UserCommonFields {
  password: string;
}

@InputType()
export class UserUpdateInput extends UserFields {
  @Field((type) => ID)
  id: number;

  new_password?: string;
}
