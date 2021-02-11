import {
  Field,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

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
export abstract class UserInputFields {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  login?: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'enum', enum: UserRolesEnum, default: UserRolesEnum.DEFAULT })
  role?: UserRolesEnum;
}

@ObjectType({ isAbstract: true })
export abstract class UserFields extends UserInputFields {
  @PrimaryGeneratedColumn()
  @Field((type) => ID)
  id: number;
}
