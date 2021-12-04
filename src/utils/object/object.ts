import { castArray as _castArray, isNil } from 'lodash';
import { DeepPartial } from 'typeorm';

export interface AnyObject {
  [key: string]: any;
}

/**
 * Если какой-то ключ объекта target равен null или undefined,
 * то применяется значение соответствующего ключа из defaults.
 * Мутирует объект target
 *
 * @param target - целевой объект
 * @param defaults - значения по умолчанию
 */
export function applyDefaults<T>(target: T, defaults: Partial<T>): void {
  for (const key of Object.keys(defaults)) {
    if (isNil(target[key])) {
      target[key] = defaults[key];
    }
  }
}

/**
 * Применяет изменения из changes в target (мутирует target)
 *
 * @param target - целевой объект
 * @param changes - изменения
 */
export function applyChanges<T>(target: T, changes: Partial<T>): void {
  for (const field of Object.keys(changes)) {
    target[field] = changes[field];
  }
}

/**
 * Инвертирует ключи и значения объекта
 * @param object - объект
 *
 * @example
 * invertObject({ a: 'b' });
 * // Возвращает { b: 'a' }
 */
export function invertObject(object: { [key: string]: string }) {
  const result: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(object)) {
    result[value] = key;
  }
  return result;
}

/**
 * Проверяет, что при мердже изменений changes в объект object
 * хотя бы одно из заданных полей fields будет изменено
 *
 * @param object - исходный объект
 * @param changes - изменения полей объекта
 * @param fields - проверяемые поля
 *
 * @example
 * isObjectChanged({ a: 5 }, { b: 6 }, ['a']) // false
 * isObjectChanged({ a: 5 }, { a: 6 }, ['a']) // true
 * isObjectChanged({ a: 5 }, { a: 5 }, ['a']) // false
 */
export function isObjectChanged<T>(
  object: T,
  changes: DeepPartial<T>,
  fields: Array<keyof T>,
) {
  for (const field of fields) {
    if (
      typeof changes[field] !== 'undefined' &&
      changes[field] !== object[field]
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Конвертирует значение в массив, возвращая undefined для null и undefined
 */
export function valueToArray<T>(value?: T | null): readonly [T] | undefined {
  return !isNil(value) ? ([value] as const) : undefined;
}

/**
 * Конвертирует значение в массив, возвращая [] для null и undefined
 */
export function castArray<T>(something: T | T[] | null | undefined): T[] {
  return isNil(something) ? [] : _castArray(something);
}
