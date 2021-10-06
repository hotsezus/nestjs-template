import { GraphQLResolveInfo } from 'graphql';
import { fieldsProjection } from 'graphql-fields-list';
import { SelectQueryBuilder } from 'typeorm';
import { FindOptionsUtils } from 'typeorm/find-options/FindOptionsUtils';

import {
  getQueryPage,
  SkipTakeOptions,
} from '../../../utils/queryBuilder/pagination';
import { PageInputInterface } from './page.input';
import { PaginationInput } from './pagination.input';

/**
 * Пробует достать имена запрашиваемых полей из метаданных graphql запроса.
 * Если возникает какая-то ошибка, то поглощает её и возвращает []
 *
 * @param info - метаданные graphql запроса
 */
export function tryGetFieldNames(info: GraphQLResolveInfo): string[] {
  try {
    const projection = fieldsProjection(info);
    return Object.keys(projection);
  } catch (e) {
    return [];
  }
}

/**
 * Возвращает список запрашиваемых полей запроса, вложенных в поле list
 *
 * @param fields - полный список полей запроса
 * @param prefix - префикс пути поля
 */
function findNestedFields(fields: string[], prefix: string) {
  const result: string[] = [];
  for (const field of fields) {
    const m = field.match(new RegExp(`^${prefix}\.(.*)$`));
    if (m && m[1]) {
      result.push(m[1]);
    }
  }
  return result;
}

/**
 * Дополняет условия запроса параметрами пагинации.
 * Мутирует options.
 *
 * @param options - условия запроса
 * @param pagination - параметры пагинации из инпута запроса
 * @param itemsLimit - максимальное количество элементов на странице
 **/
function getSkipAndTakeForPage(
  options: SkipTakeOptions,
  pagination: { onePage?: number; page?: number } | undefined,
  itemsLimit,
) {
  const { onePage = 0, page = 0 } = pagination || {};
  if (onePage > 0) {
    options.take = Math.min(onePage, itemsLimit);
  }
  if (page > 0) {
    options.skip = (options.take || 0) * (page - 1);
  }
}

/**
 * Возвращает параметры пагинации для запроса
 *
 * @param pagination - параметры пагинации
 * @param itemsLimit - максимальное количество элементов на странице
 */
function resolvePageOptions(
  pagination: PaginationInput | undefined,
  itemsLimit,
): SkipTakeOptions {
  const options: SkipTakeOptions = {
    skip: 0,
    take: itemsLimit,
  };

  if (pagination) {
    getSkipAndTakeForPage(options, pagination, itemsLimit);
  }

  return options;
}

/**
 * Применяет параметры пагинации к билдеру sql запроса
 *
 * @param info - метаданные graphql запроса
 * @param queryBuilder - билдер sql запроса
 * @param input - graphql инпут запроса
 * @param itemsLimit - максимальное количество элементов на странице
 */
export function applyQueryPagination<E, T>(
  info: GraphQLResolveInfo,
  queryBuilder: SelectQueryBuilder<E>,
  input?: PageInputInterface<T>,
  itemsLimit = 100,
) {
  const allFields = tryGetFieldNames(info);
  const listFields = findNestedFields(allFields, 'list');
  const headerFields = findNestedFields(allFields, 'header');

  const options = resolvePageOptions(input && input.pagination, itemsLimit);

  const query = FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(
    queryBuilder,
    options,
  );

  return getQueryPage({
    query,
    options,
    hasList: listFields.length > 0,
    hasHeader: headerFields.length > 0,
  });
}
