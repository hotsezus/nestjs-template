import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { intersection } from 'lodash';

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
