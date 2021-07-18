import { UnprocessableEntityException } from '@nestjs/common';

import { fixErrorPrototype, getJsonError } from './error';

/**
 * Ошибка нарушения уникального ключа при вставке или обновлении данных
 * в таблицу базы данных
 */
export class DuplicateKeyException extends UnprocessableEntityException {
  constructor(protected readonly field: string) {
    super(`Duplicate value in field "${field}"`);
    fixErrorPrototype(this);
  }
  toJSON() {
    return {
      ...getJsonError(this),
      field: this.field,
    };
  }
}

/**
 * Ошибка нарушения внешнего ключа при вставке или обновлении данных
 * в таблицу базы данных
 */
export class RelationNotFoundException extends UnprocessableEntityException {
  constructor(
    protected readonly field: string,
    protected readonly table: string,
  ) {
    super(
      `Given value of the foreign key "${field}" is not present in table "${table}"`,
    );
    fixErrorPrototype(this);
  }
  toJSON() {
    return {
      ...getJsonError(this),
      field: this.field,
      table: this.table,
    };
  }
}

/**
 * Проверяет, что ошибка PostgreSQL является ошибкой дублирования уникального ключа.
 * Если это так, то перевыбрасывает её как DuplicateKeyException.
 * В противном случае ничего не делает
 *
 * Предназначена для использования в контексте обработки HTTP или GraphQL запросов
 *
 * (!) Работает корректно только если локаль СУБД - английская
 *
 * @param e - ошибка PostgreSQL
 *
 * @example
 * try {
 *   await this.usersRepo.save(user);
 * } catch (e) {
 *   // Если нарушена уникальность ключа user.email,
 *   // то это преобразуется в ошибку DuplicateKeyException
 *   // и возвращается с HTTP-кодом 422
 *   exceptionDuplicateKey(e);
 *
 *   // Все остальные ошибки по умолчанию трактуются как
 *   // InternalServerError и возвращаются без подробностей
 *   // с HTTP-кодом 500
 *   throw e;
 * }
 */
export const exceptionDuplicateKey = (e) => {
  const match =
    e.name === 'QueryFailedError' &&
    e.detail.match(/Key \((\w+)\)=\(.+?\) already exists./);
  if (match) {
    const field = match[1];
    throw new DuplicateKeyException(field);
  }
};

/**
 * Проверяет, что ошибка PostgreSQL является ошибкой отсутствия внешнего ключа.
 * Если это так, то перевыбрасывает её как RelationNotFoundException.
 * В противном случае ничего не делает
 *
 * Предназначена для использования в контексте обработки HTTP или GraphQL запросов
 *
 * (!) Работает корректно только если локаль СУБД - английская
 *
 * @param e - ошибка PostgreSQL
 *
 * @example
 * try {
 *   await this.usersRepo.save(user);
 * } catch (e) {
 *   // Если нарушена уникальность ключа user.email,
 *   // то это преобразуется в ошибку RelationNotFoundException
 *   // и возвращается с HTTP-кодом 422
 *   exceptionRelationNotFound(e);
 *
 *   // Все остальные ошибки по умолчанию трактуются как
 *   // InternalServerError и возвращаются без подробностей
 *   // с HTTP-кодом 500
 *   throw e;
 * }
 */
export const exceptionRelationNotFound = (e) => {
  const match =
    e.name === 'QueryFailedError' &&
    e.detail.match(/Key \((\w+)\)=\(.+?\) is not present in table "(\w+)"./);
  if (match) {
    const field = match[1];
    const table = match[2];
    throw new RelationNotFoundException(field, table);
  }
};
