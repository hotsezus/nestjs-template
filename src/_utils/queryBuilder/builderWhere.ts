import { SelectQueryBuilder, WhereExpression } from 'typeorm';

import { joinProperty, PropertyDef } from './builderJoinDeep';

export type ParameterDef<Value = any> = {
  [name: string]: Value;
};

export function extractParameterNameValue<Value = any>(
  parameter: ParameterDef<Value>,
): readonly [name: string, value: Value] {
  const parameterName = Object.keys(parameter)[0];
  const value = parameter[parameterName];
  return [parameterName, value] as const;
}

/**
 * Добавляет в запрос условие вида
 *  property in (:...value)
 *
 * Если надо, джоинит промежуточные релейшены, чтобы добраться
 * до заданного поля
 *
 * @param query - билдер запроса
 * @param property - путь к полю
 * @param parameter - объект, задающий имя бинда и значение для value
 *
 * @example
 * addSimpleWhereIn(query, 'article.owner_id', { article_owner_id: [12] })
 * // вызывает
 * // query.andWhere('article.owner_id in (:...article_owner_id)', { article_owner_id: [12] })
 *
 * addSimpleWhereIn(query, 'article.owner_id', { owner_id: [] })
 * // вызывает
 * // query.andWhere('false')
 *
 * addSimpleWhereIn(query, 'article.owner_id', { owner_id: undefined })
 * // ничего не делает
 *
 * addSimpleWhereIn(query, 'article.owner.region_id', { article_owner_region_id: [1] })
 * // вызывает
 * // joinIfNotYet(query, 'article.owner', 'article_owner')
 * // query.andWhere('article_owner.region_id in (:...article_owner_region_id)', { article_owner_region_id: [1] })
 */
export function addSimpleWhereIn<T>(
  query: SelectQueryBuilder<T>,
  property: PropertyDef,
  parameter: ParameterDef<any[] | undefined>,
) {
  const [parameterName, value] = extractParameterNameValue(parameter);
  if (value === undefined) return;

  const filterProperty = joinProperty(query, property);
  if (!filterProperty) return;

  if (value.length > 0) {
    const propertyName = filterProperty[3];
    query.andWhere(`${propertyName} in (:...${parameterName})`, {
      [parameterName]: value,
    });
  } else {
    query.andWhere('false');
  }
  return query;
}

/**
 * Добавляет в запрос множество условий вида
 *  property in (:...value)
 *
 * @param query - билдер запроса
 * @param properties - объект, задающий имена полей, имена биндов и их значения
 *
 * @example
 * addSimpleWhereIns(query, {
 *   'article.owner_id': {
 *     article_owner_id: [12]
 *   },
 *   'article.status': {
 *     article_status: 'PUBLISHED'
 *   },
 *   'article.title': {
 *     article_title: undefined
 *   }
 * });
 * // вызывает:
 * // query.andWhere('article.owner_id in (:...article_owner_id)', { article_owner_id: [12] })
 * // query.andWhere('article.status in (:...article_status)', { article_status: 'PUBLISHED' })
 * // фильтр по title не применяется, так как он undefined
 */
export function addSimpleWhereIns<T>(
  query: SelectQueryBuilder<T>,
  properties: {
    [property: string]: ParameterDef<any | undefined>;
  },
) {
  for (const property of Object.keys(properties)) {
    const parameter = properties[property];
    addSimpleWhereIn(query, property, parameter);
  }
  return query;
}

/**
 * Тип для интервала значений
 */
export interface RangeType<Base = any> {
  start: Base;
  end: Base;
}

/**
 * Добавляет в запрос условие на попадение значения поля в интервал
 *
 * @param query - билдер запроса
 * @param property - путь к полю
 * @param parameter - объект, задающий имя бинда и интервал значений
 *
 * @example
 * addSimpleWhereBetween(query, 'article.created_at', {
 *   article_created_at: {
 *     start: '2021-10-01T00:00:00Z'
 *   }
 * });
 * // вызывает
 * // query.andWhere('article.created_at >= :article_created_at_start', { article_created_at_start: '2021-10-01T00:00:00Z' })
 */
export function addSimpleWhereBetween<T>(
  query: SelectQueryBuilder<T>,
  property: PropertyDef,
  parameter: ParameterDef<Partial<RangeType> | undefined>,
) {
  const [parameterName, range] = extractParameterNameValue(parameter);
  if (!range) return;
  const filterProperty = joinProperty(query, property);
  if (!filterProperty) return;
  const { start, end } = range;

  const fstart = parameterName + '_start';
  const fend = parameterName + '_end';

  if (start && end) {
    query.andWhere(`${filterProperty} between :${fstart} and :${fend}`, {
      [fstart]: start,
      [fend]: end,
    });
  } else if (start) {
    query.andWhere(`${filterProperty} >= :${fstart}`, { [fstart]: start });
  } else if (end) {
    query.andWhere(`${filterProperty} < :${fend}`, { [fend]: end });
  }

  return query;
}

/**
 * Добавляет в запрос условие
 *  field in (subquery)
 *
 * Все бинды подзапроса переносятся на основной запрос
 *
 * @param query - билдер запроса
 * @param field - поле на которое применяется условие
 * @param subQuery - подзапрос
 *
 * @example
 * const subquery = this.repo.createQueryBuilder().select();
 * const query = this.repo.createQueryBuilder().select();
 * addWhereInSubquery(
 */
export function addWhereInSubquery(
  query: WhereExpression,
  field: string,
  subQuery: SelectQueryBuilder<any>,
) {
  query.andWhere(
    `${field} in (${subQuery.getQuery()})`,
    subQuery.getParameters(),
  );
}
