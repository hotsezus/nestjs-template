import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Подставляет в обработчик запроса текущего пользователя из GraphQL-контекста
 */
export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const request = graphqlExecutionContext.getContext().req;
    return request.user;
  },
);
