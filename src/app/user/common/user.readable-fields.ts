import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PrimaryGeneratedColumn } from 'typeorm';

import { UserEditableFields } from './user.editable-fields';

@ObjectType({ isAbstract: true })
export abstract class UserReadableFields extends UserEditableFields {
  @PrimaryGeneratedColumn()
  @Field((type) => ID)
  id: number;
}
