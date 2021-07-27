import { ObjectType } from '@nestjs/graphql';

import { UserFields } from '../../database/entities/user/user.fields';
import { PageType } from '../_utils/pagination/page.type';

@ObjectType()
export class UserType extends UserFields {}

@ObjectType()
export class UserPageType extends PageType(UserType) {}
