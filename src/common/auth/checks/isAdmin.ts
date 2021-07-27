import { ExecutionContext } from '@nestjs/common';

import { UserRolesEnum } from '../../../database/entities/user/user.common-fields';
import { User } from '../../../database/entities/user/user.entity';

export function isAdmin(user: User, ctx: ExecutionContext) {
  return user.role === UserRolesEnum.ADMIN;
}
