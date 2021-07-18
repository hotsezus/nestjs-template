import { SelectQueryBuilder } from 'typeorm';

import { joinAndSelectIfNotYet, joinIfNotYet } from './builderJoin';

function appendParentToAlias(alias: string, parent: string = '') {
  if (parent) {
    return parent + '_' + alias;
  }
  return alias;
}

function appendParentToField(alias: string, parent: string = '') {
  if (parent) {
    return parent + '.' + alias;
  }
  return alias;
}

function isPropertyAliasArray(
  array: readonly any[],
): array is readonly PropertyAlias[] {
  return array.length > 0 && Array.isArray(array[0]) && array[0].length === 4;
}

/**
 * Кортеж, содержащий информацию о джоинящейся таблице
 *
 * ['field', 'alias', 'parent_alias', 'parent.field']
 */
export type PropertyAlias = [
  property: string,
  alias: string,
  fullAlias: string,
  field: string,
];

/**
 * Описание поля для джоина в виде строки "entity.field1.<...>.fieldN"
 * или массива ['entity', 'field1', ..., 'fieldN']
 *
 * Описание поля может содержать алиасы для промежуточных полей и финального поля,
 * например "entity.(field1 as alias1).field2",
 * либо в виде массива ['entity', '(field1 as alias1)', 'field2']
 */
export type PropertyDef = string | readonly string[] | readonly PropertyAlias[];

/**
 * Преобразует описание поля для джоина в кортеж информации о джоинящейся таблице
 *
 * @param propertyDef - описание поля для джоина в формате "field" или "(field as alias)"
 * @param parent - алиас родительской таблицы
 *
 * @example
 * extractPropertyAlias('field') // ['field', 'field', 'field', 'field']
 * extractPropertyAlias('(field as alias)') // ['field', 'alias', 'field', 'alias']
 * extractPropertyAlias('field', 'parent') // ['field', 'field', 'parent_field', 'parent.field']
 * extractPropertyAlias('(field as alias)', 'parent') // ['field', 'alias', 'parent_alias', 'parent.field']
 */
export function extractPropertyAlias(
  propertyDef: string,
  parent: string = '',
): PropertyAlias {
  const matches = propertyDef.match(/^\((.+)\s+as\s+(.+)\)$/);
  if (!matches) {
    return [
      propertyDef,
      propertyDef,
      appendParentToAlias(propertyDef, parent),
      appendParentToField(propertyDef, parent),
    ];
  }
  return [
    matches[1],
    matches[2],
    appendParentToAlias(matches[2], parent),
    appendParentToField(matches[1], parent),
  ];
}

/**
 * Разбирает цепочку релейшенов на отдельные джоины
 *
 * @param property - цепочка релейшенов для джоина в виде строки "entity.field1.field2.<...>.fieldN"
 *  или массива ['entity', 'field1', 'field2', ..., 'fieldN' ]
 *
 *  Описание поля может содержать алиасы для промежуточных полей и финального поля,
 *  например "entity.(field1 as alias1).field2",
 *  либо в виде массива ['entity', '(field1 as alias1)', 'field2']
 *
 * @example
 * splitPropertyPath('article.owner')
 * // [
 * //   ['article', 'article', 'article', 'article'],
 * //   ['owner', 'owner', 'article_owner', 'article.owner']
 * // ]
 * splitPropertyPath('article.(owner as o)')
 * // [
 * //   ['article', 'article', 'article', 'article'],
 * //   ['owner', 'o', 'article_o', 'article.owner']
 * // ]
 * splitPropertyPath('article.owner.region')
 * // [
 * //   ['article', 'article', 'article', 'article'],
 * //   ['owner', 'owner', 'article_owner', 'article.owner'],
 * //   ['region', 'region', 'article_owner_region', 'article_owner.region']
 * // ]
 * splitPropertyPath('article.(owner as o).region')
 * // [
 * //   ['article', 'article', 'article', 'article'],
 * //   ['owner', 'o', 'article_o', 'article.owner'],
 * //   ['region', 'region', 'article_o_region', 'article_o.region']
 * // ]
 * splitPropertyPath('article.(owner as o).(region as r)')
 * // [
 * //   ['article', 'article', 'article', 'article'],
 * //   ['owner', 'o', 'article_o', 'article.owner'],
 * //   ['region', 'r', 'article_o_r', 'article_o.region']
 * // ]
 */
export function splitPropertyPath(
  property: PropertyDef,
): readonly PropertyAlias[] {
  const propertyPath =
    typeof property === 'string' ? property.split('.') : property;

  if (isPropertyAliasArray(propertyPath)) {
    return property as PropertyAlias[];
  }

  const pathSize = propertyPath.length;
  if (pathSize < 2) {
    return [];
  }

  const tables: PropertyAlias[] = [];
  let parent: string = '';
  for (const fieldDef of propertyPath) {
    const aliasInfo = extractPropertyAlias(fieldDef, parent);
    tables.push(aliasInfo);
    parent = aliasInfo[2];
  }

  return tables;
}

/**
 * Выполняет глубокий последовательный джоин для переданной цепочки релейшенов,
 * а также добавляет поля финальной и всех промежуточных таблиц в селект.
 * Промежуточные и финальный релейшены джоинятся только если они ещё не приджоинены
 *
 * @param query - билдер запроса
 * @param property - описание поля для джоина в виде строки "entity.field1.<...>.fieldN"
 *  или массива ['entity', 'field1', ..., 'fieldN']
 *
 *  Описание поля может содержать алиасы для промежуточных полей и финального поля,
 *  например "entity.(field1 as alias1).field2",
 *  либо в виде массива ['entity', '(field1 as alias1)', 'field2']
 *
 * @param joinType - тип джоина INNER или LEFT
 *
 * @example
 * joinAndSelectIfNotYetDeep(query, 'article.owner.region')
 * // в итоге вызывает последовательно:
 * // joinAndSelectIfNotYet(query, 'article.owner', 'article_owner')
 * // joinAndSelectIfNotYet(query, 'article_owner.region', 'article_owner_region')
 *
 * joinAndSelectIfNotYetDeep(query, 'article.(owner as o).region')
 * // в итоге вызывает последовательно:
 * // joinAndSelectIfNotYet(query, 'article.owner', 'article_o')
 * // joinAndSelectIfNotYet(query, 'article_o.region', 'article_o_region')
 *
 * joinAndSelectIfNotYetDeep(query, 'article.(owner as o).(region as r)')
 * // в итоге вызывает последовательно:
 * // joinAndSelectIfNotYet(query, 'article.owner', 'article_o')
 * // joinAndSelectIfNotYet(query, 'article_o.region', 'article_o_r')
 */
export function joinAndSelectIfNotYetDeep<T>(
  query: SelectQueryBuilder<T>,
  property: PropertyDef,
  joinType: 'INNER' | 'LEFT' = 'INNER',
) {
  const tables = splitPropertyPath(property);
  if (tables.length <= 1) return;

  for (let i = 1; i < tables.length; i++) {
    const [, , fullAlias, tableField] = tables[i];
    joinAndSelectIfNotYet(query, tableField, fullAlias, joinType);
  }

  return query;
}

/**
 * Выполняет глубокий последовательный джоин для переданной цепочки релейшенов.
 * Промежуточные и финальный релейшены джоинятся только если они ещё не приджоинены
 *
 * @param query - билдер запроса
 * @param property - описание поля для джоина в виде строки "entity.field1.<...>.fieldN"
 *  или массива ['entity', 'field1', ..., 'fieldN']
 *
 *  Описание поля может содержать алиасы для промежуточных полей и финального поля,
 *  например "entity.(field1 as alias1).field2",
 *  либо в виде массива ['entity', '(field1 as alias1)', 'field2']
 *
 * @param joinType - тип джоина INNER или LEFT
 *
 * @example
 * joinIfNotYetDeep(query, 'article.owner.region')
 * // в итоге вызывает последовательно:
 * // joinIfNotYet(query, 'article.owner', 'article_owner')
 * // joinIfNotYet(query, 'article_owner.region', 'article_owner_region')
 *
 * joinIfNotYetDeep(query, 'article.(owner as o).region')
 * // в итоге вызывает последовательно:
 * // joinIfNotYet(query, 'article.owner', 'article_o')
 * // joinIfNotYet(query, 'article_o.region', 'article_o_region')
 *
 * joinIfNotYetDeep(query, 'article.(owner as o).(region as r)')
 * // в итоге вызывает последовательно:
 * // joinIfNotYet(query, 'article.owner', 'article_o')
 * // joinIfNotYet(query, 'article_o.region', 'article_o_r')
 */
export function joinIfNotYetDeep<T>(
  query: SelectQueryBuilder<T>,
  property: PropertyDef,
  joinType: 'INNER' | 'LEFT' = 'INNER',
) {
  const tables = splitPropertyPath(property);
  if (tables.length <= 1) return;

  for (let i = 1; i < tables.length; i++) {
    const [, , fullAlias, tableField] = tables[i];
    joinIfNotYet(query, tableField, fullAlias, joinType);
  }

  return query;
}

/**
 * Выполняет глубокий последовательный джоин для переданного описания поля.
 * Промежуточные релейшены джоинятся только если они ещё не приджоинены.
 * Финальное поле не считается за релейшен и не джоинится.
 *
 * @param query - билдер запроса
 * @param property - описание поля для джоина в виде строки "entity.field1.<...>.fieldN"
 *  или массива ['entity', 'field1', ..., 'fieldN']
 *
 *  Описание поля может содержать алиасы для промежуточных полей и финального поля,
 *  например "entity.(field1 as alias1).field2",
 *  либо в виде массива ['entity', '(field1 as alias1)', 'field2']
 *
 * @param joinType - тип джоина INNER или LEFT
 *
 * @example
 * joinProperty(query, 'article.owner.region_id')
 * // в итоге вызывает:
 * // joinIfNotYetDeep(query, 'article.owner')
 * // и возвращает:
 * // ['region_id', 'region_id', 'article_owner_region_id', 'article_owner.region_id']
 *
 * joinProperty(query, 'article.(owner as o).region_id')
 * // в итоге вызывает:
 * // joinIfNotYetDeep(query, 'article.(owner as o)')
 * // и возвращает:
 * // ['region_id', 'region_id', 'article_o_region_id', 'article_o.region_id']
 *
 * joinProperty(query, 'article.(owner as o).(region_id as r)')
 * // в итоге вызывает:
 * // joinIfNotYetDeep(query, 'article.(owner as o)')
 * // и возвращает:
 * // ['region_id', 'r', 'article_o_r', 'article_o.region_id']
 */
export function joinProperty<T>(
  query: SelectQueryBuilder<T>,
  property: PropertyDef,
  joinType: 'INNER' | 'LEFT' = 'INNER',
) {
  const tables = splitPropertyPath(property);
  if (tables.length <= 1) {
    return null;
  }
  const tablesSize = tables.length - 1;
  joinIfNotYetDeep(query, tables.slice(0, tablesSize - 1), joinType);
  return tables[tablesSize - 1];
}
