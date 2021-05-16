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
  context: ({ req, connection }) =>
    connection ? { req: connection.context } : { req },
  // Позволяет использовать guard'ы на @ResolveField
  fieldResolverEnhancers: ['guards'],
  buildSchemaOptions: {
    // Нужно чтобы TS с типом number по умолчанию имели тип `GraphQLInt` в сгенерированной схеме
    // В случаях, если поле должно быть Float, нужно принудительно указать это при помощи
    // @Field(() => GraphQLFloat, {...})
    numberScalarMode: 'integer',
  },
};

export const playgroundConfig = {
  introspection: graphqlEnablePlayground,
  playground: graphqlEnablePlayground
    ? {
        endpoint: graphqlPlaygroundEndpoint,
      }
    : false,
};
