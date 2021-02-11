import { Field, ObjectType } from '@nestjs/graphql';

import { UserType } from '../user/user.type';
import { UserAuthTokenType } from './userAuthToken.type';

@ObjectType()
export class AuthResponseType {
  user?: UserType;

  accessToken: string;

  refreshToken: UserAuthTokenType;
}
