import { SelectQueryBuilder } from 'typeorm';

import {
  joinIfNotYetDeep,
  PropertyDef,
  splitPropertyPath,
} from './builderJoinDeep';

/**
 * Применяет группировку (group by) по заданному полю,
 * и добавляет его в выборку
 *
 * @param query - билдер запроса
 * @param property - путь к полю
 * @returns fieldName - алиас поля из выборки
 *
 * @example
 * applyGroupByDeep(query, 'article.owner.region_id')
 * // Делает INNER JOIN релейшена article.owner с алиасом article_owner
 * // Добавляет поле article_owner.region_id в селект под алиасом
 * // article_owner_region_id
 * // Возвращает
 * // 'article_owner_region_id'
 */
export function applyGroupByDeep<T>(
  query: SelectQueryBuilder<T>,
  property: PropertyDef,
) {
  const splitPath = splitPropertyPath(property);
  const pathSize = splitPath.length;
  if (pathSize <= 1) {
    return;
  }
  const tables = splitPath.slice(0, pathSize - 1);
  const field = splitPath[pathSize - 1];
  joinIfNotYetDeep(query, tables);
  query.addSelect(field[3], field[2]);
  query.addGroupBy(field[3]);
  return field[2];
}

/**
 * Применяет несколько группировок (group by) по разным полям
 * а также добавляет их в выборку
 *
 * @param query - билдер запроса
 * @param groupBy - набор названий полей для группировки
 * @param actionMap - объект, ключами которого являются названия полей,
 *  а значениями - описание полные пути к полям
 * @returns fieldName[] - массив алиасов полей из выборки
 *
 * @example
 * const inputGroupBy = ['region']
 * applyMultipleGroupBy(query, inputGroupBy, {
 *   region: 'article.owner.region_id',
 *   user: 'article.owner_id'
 * });
 * // Применяется только группировка по article.owner.region_id
 * // Делает INNER JOIN релейшена article.owner с алиасом article_owner
 * // Добавляет поле article_owner.region_id в селект под алиасом
 * // article_owner_region_id
 * // Возвращает
 * // ['article_owner_region_id']
 */
export function applyMultipleGroupBy<T>(
  query: SelectQueryBuilder<T>,
  groupBy: string[],
  actionMap: { [field: string]: PropertyDef },
) {
  const groupFields: string[] = [];
  for (const group of groupBy) {
    if (actionMap[group]) {
      const alias = applyGroupByDeep(query, actionMap[group]);
      if (alias) {
        groupFields.push(alias);
      }
    }
  }

  return groupFields;
}
