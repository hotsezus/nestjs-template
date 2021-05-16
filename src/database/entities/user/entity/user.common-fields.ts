import {
  Extensions,
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
  login?: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Extensions({ requiredRole: UserRolesEnum.ADMIN })
  @Column({ type: 'enum', enum: UserRolesEnum, default: UserRolesEnum.DEFAULT })
  role?: UserRolesEnum;
}
