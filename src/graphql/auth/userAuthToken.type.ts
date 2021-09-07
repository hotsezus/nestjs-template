import { ObjectType } from '@nestjs/graphql';

import { UserAuthTokenFields } from '../../database/entities/userTokens/userAuthToken.fields';

@ObjectType()
export class UserAuthTokenType extends UserAuthTokenFields {}
