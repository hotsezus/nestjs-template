import { ObjectType } from '@nestjs/graphql';

import { UserAuthTokenFields } from '../../userTokens/userAuthToken.fields';

@ObjectType()
export class UserAuthTokenType extends UserAuthTokenFields {}
