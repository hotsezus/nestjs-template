import { tryNumber } from '@proscom/ui-utils';

/**
 * Содержимое краткосрочного jwt-токена
 */
export interface JwtAccessPayload {
  // Идентификатор пользователя
  id: number;
}

/**
 * Секретный ключ для jwt-токенов
 */
export const jwtSecretKey = process.env.JWT_SECRET_KEY;
if (!jwtSecretKey) {
  throw new Error('JWT_SECRET_KEY is not found in the environment');
}

/**
 * Время действия jwt-токена
 */
export const jwtExpiration = tryNumber(process.env.JWT_EXPIRATION, 3600);

/**
 * Время действия долгосрочного токена
 */
export const refreshExpiration = tryNumber(
  process.env.REFRESH_TOKEN_EXPIRATION,
  7 * 24 * 3600,
);

/**
 * Сложность генерации соли для хеширования пароля
 */
export const saltRounds = tryNumber(process.env.BCRYPT_HASH_ROUNDS, 12);

/**
 * Длина долгосрочного токена аутентификации
 */
export const refreshTokenLength = tryNumber(
  process.env.REFRESH_TOKEN_LENGTH,
  256,
);

/**
 * Время, в течение которого долгосрочный токен может быть повторно использован
 * для получения нового краткосрочного токена
 */
export const refreshTokenReuseTimeout = tryNumber(
  process.env.REFRESH_TOKEN_REUSE_TIMEOUT,
  60,
);
