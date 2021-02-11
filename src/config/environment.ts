import { booleanEnv } from './tools';

export const isProduction = process.env.NODE_ENV === 'production';

// GraphQL переменные
export const graphqlEnablePlayground = booleanEnv(
  process.env.GRAPHQL_ENABLE_PLAYGROUND,
);
export const graphqlPlaygroundEndpoint =
  process.env.GRAPHQL_PLAYGROUND_ENDPOINT || '/graphql';
export const graphqlEnableDebug = booleanEnv(process.env.GRAPHQL_ENABLE_DEBUG);

// TypeORM переменные
export const typeormBaseDirectory =
  process.env.TYPEORM_BASE_DIRECTORY || 'dist';
