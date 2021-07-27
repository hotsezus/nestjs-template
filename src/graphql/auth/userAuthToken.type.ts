import { ObjectType } from '@nestjs/graphql';

import { UserAuthTokenFields } from '../../database/entities/userTokens/userAuthTokenFields';

@ObjectType()
export class UserAuthTokenType extends UserAuthTokenFields {}
