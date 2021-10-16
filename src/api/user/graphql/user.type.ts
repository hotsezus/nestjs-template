import { ObjectType } from '@nestjs/graphql';

import { PageType } from '../../../utils/graphql/pagination/page.type';
import { UserFields } from '../common/user.fields';

@ObjectType()
export class UserType extends UserFields {}

@ObjectType()
export class UserPageType extends PageType(UserType) {}
