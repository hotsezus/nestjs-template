import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

export type PropertyMap<Entity> = { [key in keyof Entity]: string };

/**
 * Расчитывает мэп соответствий между названиями полей TypeORM-сущности
 * и названием столбца в БД
 *
 * @param repository - репозиторий сущности
 */
function _getPropertyMap<Entity>(
  repository: Repository<Entity>,
): PropertyMap<Entity> {
  const result = {};
  for (const column of repository.metadata.ownColumns) {
    result[column.propertyName] = column.databaseName;
  }
  return result as PropertyMap<Entity>;
}

/**
 * Кешируем информацию о сущностях на всё время жизни приложения.
 * Так как для изменения структуры полей сущности требуется изменение
 * Entity и перекомпиляция кода, то такое кеширование не приведет
 * к использованию устаревших данных
 */
const memo = new Map<Repository<any>, PropertyMap<any>>();

/**
 * Возвращает мэп соответствий между названиями полей TypeORM-сущности
 * и названием столбца в БД
 *
 * @param repository - репозиторий сущности
 */
export function getPropertyMap<Entity>(
  repository: Repository<Entity>,
): PropertyMap<Entity> {
  const memoized = memo.get(repository);
  if (memoized) {
    return memoized;
  }
  const result = _getPropertyMap(repository);
  memo.set(repository, result);
  return result;
}

/**
 * Проверяет, есть ли в билдере запроса приджоиненная таблица
 * с заданным алиасом
 *
 * @param query - билдер запроса
 * @param aliasName - название алиаса
 */
export function hasJoinAlias<T>(
  query: SelectQueryBuilder<T>,
  aliasName: string,
) {
  return query.expressionMap.aliases.some(
    (queryAlias) => queryAlias.type === 'join' && queryAlias.name === aliasName,
  );
}

/**
 * Джоинит релейшн сущности к запросу под заданным алиасом и добавляет
 * его поля в селект, если этого ещё не было сделано ранее.
 *
 * Для сохранения корректности выборки при наличии в запросе LIMIT/OFFSET
 * рекомендуется использовать данный метод только для ManyToOne и OneToOne релейшенов.
 *
 * Если aliasName не передан, то он расчитывается из property заменой "." на "_".
 *
 * @param query - билдер запроса
 * @param property - имя релейшена в формате "алиас.проперти", например "article.owner"
 * @param aliasName - название алиаса для приджоиненной таблицы
 * @param joinType - тип джоина INNER или LEFT
 */
export function joinAndSelectIfNotYet<T>(
  query: SelectQueryBuilder<T>,
  property: string,
  aliasName?: string,
  joinType: 'INNER' | 'LEFT' = 'INNER',
) {
  aliasName = aliasName || property.split('.').join('_');
  if (!hasJoinAlias(query, aliasName)) {
    if (joinType === 'LEFT') {
      return query.leftJoinAndSelect(property, aliasName);
    } else {
      return query.innerJoinAndSelect(property, aliasName);
    }
  }
  return query;
}

/**
 * Джоинит релейшн сущности к запросу под заданным алиасом,
 * если этого ещё не было сделано ранее.
 *
 * Для сохранения корректности выборки при наличии в запросе LIMIT/OFFSET
 * рекомендуется использовать данный метод только для ManyToOne и OneToOne релейшенов.
 *
 * Если aliasName не передан, то он расчитывается из property заменой "." на "_".
 *
 * @param query - билдер запроса
 * @param property - имя релейшена в формате "алиас.проперти", например "article.owner"
 * @param aliasName - название алиаса для приджоиненной таблицы
 * @param joinType - тип джоина INNER или LEFT
 */
export function joinIfNotYet<T>(
  query: SelectQueryBuilder<T>,
  property: string,
  aliasName?: string,
  joinType: 'INNER' | 'LEFT' = 'INNER',
) {
  aliasName = aliasName || property.split('.')[1];
  if (!hasJoinAlias(query, aliasName)) {
    if (joinType === 'LEFT') {
      return query.leftJoin(property, aliasName);
    } else {
      return query.innerJoin(property, aliasName);
    }
  }
  return query;
}

/**
 * Джоинит сущность к запросу под заданным алиасом по переданному условию,
 * если этого ещё не было сделано ранее.
 *
 * Для сохранения корректности выборки при наличии в запросе LIMIT/OFFSET
 * рекомендуется использовать данный метод только для ManyToOne и OneToOne релейшенов.
 *
 * @param query - билдер запроса
 * @param entity - класс сущности
 * @param alias - алиас для приджоиненной таблицы в запросе
 * @param condition - условия джоина (можно использовать бинды)
 * @param parameters - бинды параметров для condition
 * @param joinType - тип джоина INNER или LEFT
 */
export function joinIfNotYetEntity<T>(
  query: SelectQueryBuilder<T>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  entity: Function | string,
  alias: string,
  condition?: string,
  parameters?: ObjectLiteral,
  joinType: 'INNER' | 'LEFT' = 'INNER',
) {
  if (!hasJoinAlias(query, alias)) {
    if (joinType === 'LEFT') {
      return query.leftJoin(entity, alias, condition, parameters);
    } else {
      return query.innerJoin(entity, alias, condition, parameters);
    }
  }
  return query;
}

/**
 * Возвращает информацию о приджоиненной таблице по её алиасу
 *
 * @param query - билдер запроса
 * @param tableAlias - алиас приджоиненной таблицы
 */
export function getJoinedAliasInfo<T>(
  query: SelectQueryBuilder<T>,
  tableAlias?: string,
) {
  if (tableAlias) {
    return query.expressionMap.aliases.find(
      (alias) => alias.name === tableAlias,
    );
  } else {
    return query.expressionMap.mainAlias;
  }
}

/**
 * Возвращает информацию об основном алиасе запроса
 *
 * @param query - билдер запроса
 */
export function getMainAlias<T>(query: SelectQueryBuilder<T>) {
  return query.expressionMap.mainAlias;
}
