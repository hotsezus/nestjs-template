import { ExecutionContext } from '@nestjs/common';

import { User } from '../../../database/entities/user/user.entity';
import { UserRolesEnum } from '../../../database/entities/user/userFields';

export function isAdmin(user: User, ctx: ExecutionContext) {
  return user.role === UserRolesEnum.ADMIN;
}
