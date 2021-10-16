import { ExecutionContext } from '@nestjs/common';

import { UserRolesEnum } from '../../api/user/common/user.common-fields';
import { User } from '../../api/user/database/user.entity';

export function isAdmin(user: User, ctx: ExecutionContext) {
  return user.role === UserRolesEnum.ADMIN;
}
