import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

import {
  UserFields,
  UserInputFields,
} from '../../database/entities/user/userFields';

@ObjectType()
export class UserType extends UserFields {}

@InputType()
export class UserCreateInput extends UserInputFields {
  password: string;
}

@InputType()
export class UserUpdateInput extends UserFields {
  @Field((type) => ID)
  id: number;

  new_password?: string;
}
