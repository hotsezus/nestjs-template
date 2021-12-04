import { Field, ObjectType } from '@nestjs/graphql';

import { UserType } from '../../user/graphql/user.type';
import { UserAuthTokenType } from './userAuthToken.type';

@ObjectType()
export class AuthResponseType {
  @Field(() => UserType)
  user?: UserType;

  @Field(() => String)
  accessToken: string;

  @Field(() => UserAuthTokenType)
  refreshToken: UserAuthTokenType;
}
