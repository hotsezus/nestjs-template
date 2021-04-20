import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Constructor } from '@nestjs/common/utils/merge-with-values.util';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';

import { User } from '../../database/entities/user/entity/user.entity';

export type UserGuardCheck = (
  user: User,
  ctx: GraphQLExecutionContext,
) => boolean;

export function UserGuard(check: UserGuardCheck): Constructor<CanActivate> {
  @Injectable()
  class UserCheckGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      const gcontext = ctx.getContext();
      const user: User = gcontext.req.user;
      return check(user, ctx);
    }
  }

  return UserCheckGuard;
}
