import { ExecutionContext } from '@nestjs/common';

import { UserRolesEnum } from '../../../user/common/user.common-fields';
import { User } from '../../../user/database/user.entity';

export function isAdmin(user: User, ctx: ExecutionContext) {
  return user.role === UserRolesEnum.ADMIN;
}
