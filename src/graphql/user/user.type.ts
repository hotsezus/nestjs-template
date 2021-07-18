import { ObjectType } from '@nestjs/graphql';

import { UserFields } from '../../database/entities/user/user.fields';

@ObjectType()
export class UserType extends UserFields {}
