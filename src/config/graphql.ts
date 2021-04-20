import { GqlModuleOptions } from '@nestjs/graphql';

import {
  graphqlEnableDebug,
  graphqlEnablePlayground,
  graphqlPlaygroundEndpoint,
} from './environment';

export const initialConfig: Partial<GqlModuleOptions> = {
  debug: graphqlEnableDebug,
  /**
   * Функция формирует GraphQL-контекст из Express-контекста.
   * Используется для проверки аутентификации пользователя по заголовку запроса
   */
  context: (req) => ({
    req,
  }),
  // Позволяет использовать guard'ы на @ResolveField
  fieldResolverEnhancers: ['guards'],
};

export const playgroundConfig = {
  introspection: graphqlEnablePlayground,
  playground: graphqlEnablePlayground
    ? {
        endpoint: graphqlPlaygroundEndpoint,
      }
    : false,
};
