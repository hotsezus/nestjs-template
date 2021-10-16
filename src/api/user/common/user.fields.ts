import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PrimaryGeneratedColumn } from 'typeorm';

import { UserCommonFields } from './user.common-fields';

@ObjectType({ isAbstract: true })
export abstract class UserFields extends UserCommonFields {
  @PrimaryGeneratedColumn()
  @Field((type) => ID)
  id: number;
}
