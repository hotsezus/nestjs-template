import { tryNumber } from '@proscom/ui-utils';
import path from 'path';

import { booleanEnv } from './tools';

export const isProduction = process.env.NODE_ENV === 'production';

export const appPort = tryNumber(process.env.APP_PORT, 5000);
export const appHost = process.env.APP_HOST || 'localhost';

// Ограничение размера принимаемого json
// Актуально при необходимости обрабатывать большие запросы размером body более 100kb
export const jsonLimit = process.env.JSON_BODY_LIMIT || '1mb';

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
