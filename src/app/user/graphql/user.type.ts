import { ObjectType } from '@nestjs/graphql';

import { PageType } from '../../../utils/graphql/pagination/page.type';
import { UserReadableFields } from '../common/user.readable-fields';

@ObjectType()
export class UserType extends UserReadableFields {}

@ObjectType()
export class UserPageType extends PageType(UserType) {}
