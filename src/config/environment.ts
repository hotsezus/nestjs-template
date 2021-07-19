import { tryNumber } from '@proscom/ui-utils';

import { booleanEnv } from './tools';

export const isProduction = process.env.NODE_ENV === 'production';

export const appPort = tryNumber(process.env.APP_PORT, 5000);
export const appHost = process.env.APP_HOST || 'localhost';

/**
 * Ограничение размера принимаемого json.
 * Актуально при необходимости обрабатывать большие запросы размером body более 100kb
 */
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

// Одноразовые токены
/**
 * Время жизни одноразового токена в секундах
 */
export const oneTimeTokenExpiration = tryNumber(
  process.env.ONE_TIME_TOKEN_EXPIRATION,
  60,
);

/**
 * Время жизни токена, хранящего сессию между началом и концом oauth (секунды)
 */
export const oauthTokenExpiration = tryNumber(
  process.env.OAUTH_TOKEN_EXPIRATION,
  600,
);

/**
 * Включает возможность возврата данных пользователя на другой домен.
 * На продуктивном стенде данный режим необходимо отключить
 */
export const enableOAuthOriginOverride = booleanEnv(
  process.env.ENABLE_OAUTH_ORIGIN_OVERRIDE,
);

/**
 * Адрес фронтенда для передачи информации о входе через соцсеть
 */
export const socialFrontendOrigin =
  process.env.SOCIAL_FRONTEND_ORIGIN || 'localhost:3000';
