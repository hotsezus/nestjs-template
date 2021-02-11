import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export enum TokenType {
  REFRESH = 'REFRESH',
}

registerEnumType(TokenType, {
  name: 'TokenType',
});

@ObjectType({ isAbstract: true })
export abstract class UserAuthTokenFields {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ type: 'enum', enum: TokenType })
  @Field(() => TokenType)
  type: TokenType;

  @Column({ type: 'varchar', length: 1024 })
  @Field()
  token: string;

  @Column({ type: 'timestamptz', nullable: true })
  @Field({ nullable: true })
  expires_at?: Date;
}
