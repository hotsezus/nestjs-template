import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

import { STRATEGY_JWT } from '../common/jwtStrategy.service';

/**
 * Guard, требующий аутентифицированного пользователя для GraphQL-запроса
 */
@Injectable()
export class GraphqlAuthGuard extends AuthGuard(STRATEGY_JWT) {
  /**
   * Переопределенная функция получения входящего запроса для AuthGuard.
   * Получает запрос из GraphQL-контекста.
   * GraphQL-контекст заполняется функцией context в GraphqlModule
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gcontext = ctx.getContext();
    return gcontext.req;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid Token');
    }
    return user;
  }
}
