import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Constructor } from '@nestjs/common/utils/merge-with-values.util';
import { GqlExecutionContext } from '@nestjs/graphql';

import { TypeormDataLoaders } from './TypeormDataLoader';

/**
 * Декоратор для аргумента резолвера, позволяющий получить даталоадер для заданной сущности
 */
export const InjectEntityLoader = <T extends { id: any }>(
  Entity: Constructor<T>,
  connection?: string,
) => {
  return createParamDecorator((data_, context: ExecutionContext) => {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const ctx = graphqlExecutionContext.getContext();
    if (ctx.typeormDataLoaders) {
      const dl: TypeormDataLoaders = ctx.typeormDataLoaders;
      return dl.getEntityLoader(Entity, connection);
    }
    throw new Error(
      `Variable 'typeormDataLoaders' is not found in the GraphQL context`,
    );
  })();
};
