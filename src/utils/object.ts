import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { castArray as _castArray,intersection, isNil } from 'lodash';
import { DeepPartial } from 'typeorm';

export function applyDefaults<T>(target: T, defaults: Partial<T>): void {
  for (const key of Object.keys(defaults)) {
    if (isNil(target[key])) {
      target[key] = defaults[key];
    }
  }
}

export function applyChanges<T>(target: T, changes: Partial<T>): void {
  for (const field of Object.keys(changes)) {
    target[field] = changes[field];
  }
}

export function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result = { ...obj };
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined) {
      delete result[key];
    }
  }
  return result;
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
 * Определяет пересечение переданных массивов, если хотя бы один из них
 * валидный. В противном случае возвращает undefined
 *
 * @param arrays - набор массивов или undefined
 */
export function nullishArraysIntersection<T>(
  ...arrays: Array<Array<T> | undefined>
): Array<T> | undefined {
  const definedArrays = arrays.filter((arr) => Array.isArray(arr));
  if (definedArrays.length > 0) {
    return intersection(...definedArrays);
  } else {
    return undefined;
  }
}

/**
 * Определяет пересечение переданных значений, если хотя бы одно из них
 * не undefined. В противном случае возвращает undefined
 *
 * @param values - набор значений или undefined
 *
 * @example
 * nullishValuesIntersection(undefined, undefined) // undefined
 * nullishValuesIntersection(5, undefined) // 5
 * nullishValuesIntersection(5, 6) // undefined
 * nullishValuesIntersection(5, 5) // 5
 */
export function nullishValuesIntersection<T>(
  ...values: Array<T | undefined>
): T | undefined {
  const definedValues = values.filter((arr) => !isUndefined(arr));
  if (definedValues.length > 0) {
    return definedValues.every((value) => value === definedValues[0])
      ? definedValues[0]
      : undefined;
  } else {
    return undefined;
  }
}

/**
 * Объединяет два объекта в один, пересекая значения общих ключей
 *
 * @param object - исходный объект
 * @param changes - второй объект
 *
 * @example
 * nullishIntersectionMerge({
 *   a: 5,
 *   b: [1,2,3],
 *   c: 5
 * }, {
 *   b: [2,3],
 *   c: 6,
 *   d: 7
 * })
 * // Возвращает
 * // { a: 5, b: [2,3], c: undefined, d: 7 }
 */
export function nullishIntersectionMerge<T>(
  object: T | undefined,
  changes: Partial<T>,
): T {
  const result = { ...object };
  for (const key of Object.keys(changes)) {
    if (Array.isArray(result[key]) || Array.isArray(changes[key])) {
      result[key] = nullishArraysIntersection(result[key], changes[key]);
    } else {
      result[key] = nullishValuesIntersection(result[key], changes[key]);
    }
  }
  return result as T;
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
