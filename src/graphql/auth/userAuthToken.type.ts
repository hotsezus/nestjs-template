import { ObjectType } from '@nestjs/graphql';

import { UserAuthTokenFields } from '../../database/entities/user/userAuthTokenFields';

@ObjectType()
export class UserAuthTokenType extends UserAuthTokenFields {}
