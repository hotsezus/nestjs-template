import { Field, ID, InputType } from '@nestjs/graphql';

import { UserCommonFields } from '../../database/entities/user/entity/user.common-fields';
import { UserFields } from '../../database/entities/user/entity/user.fields';

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
