import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Column } from 'typeorm';

export enum UserRolesEnum {
  DEFAULT = 'DEFAULT',
  ADMIN = 'ADMIN',
}

registerEnumType(UserRolesEnum, {
  name: 'UserRolesEnum',
  description: 'Роль пользователя',
});

@InputType({ isAbstract: true })
@ObjectType({ isAbstract: true })
export abstract class UserCommonFields {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  @Field(() => String, { nullable: true })
  login?: string | null;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  @Field(() => String, { nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Field(() => String, { nullable: true })
  name?: string | null;

  @Column({ type: 'enum', enum: UserRolesEnum, default: UserRolesEnum.DEFAULT })
  @Field(() => UserRolesEnum, { nullable: true })
  role?: UserRolesEnum | null;
}
