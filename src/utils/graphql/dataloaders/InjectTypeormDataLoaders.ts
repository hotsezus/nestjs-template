import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Декоратор для аргумента резолвера, позволяющий получить сервис даталоадеров
 */
export const InjectTypeormDataLoaders = () => {
  return createParamDecorator((data_, context: ExecutionContext) => {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const ctx = graphqlExecutionContext.getContext();
    if (ctx.typeormDataLoaders) {
      return ctx.typeormDataLoaders;
    }
    throw new Error(
      `Variable 'typeormDataLoaders' is not found in the GraphQL context`,
    );
  })();
};
