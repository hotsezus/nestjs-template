/**
 * Исправляет прототип инстанса класса, расширяющего Error
 *
 * @param error - инстанс класса
 *
 * @see https://stackoverflow.com/questions/41102060/typescript-extending-error-class
 */
export function fixErrorPrototype(error: Error) {
  Object.setPrototypeOf(error, error.constructor.prototype);
  error.name = error.constructor.name;
}

/**
 * Возвращает представление ошибки в виде простого объекта.
 * Полезно для сериализации в JSON
 *
 * @param error - объект ошибки
 */
export function getJsonError(error: any) {
  if ('toJSON' in error && typeof error.toJSON === 'function') {
    return error.toJSON();
  }

  const result: Record<string, unknown> = {};

  for (const prop of Object.getOwnPropertyNames(error)) {
    result[prop] = error[prop];
  }

  return result;
}

/**
 * Базовый класс для ошибок уровня приложения.
 * Расширяйте его, чтобы избежать проблем с прототипом Error.
 *
 * @see https://stackoverflow.com/questions/41102060/typescript-extending-error-class
 */
export class CustomError extends Error {
  constructor(message) {
    super(message);
    fixErrorPrototype(this);
  }
}
