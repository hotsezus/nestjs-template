import { SelectQueryBuilder } from 'typeorm';

/**
 * Направление сортировки
 */
export enum SortingDirectionEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Положение null значений при сортировке
 */
export enum SortingNullsPositionEnum {
  FIRST = 'NULLS FIRST',
  LAST = 'NULLS LAST',
}

/**
 * Описание сортировки по одному полю
 */
export interface BasicSorting {
  field: string;
  direction: SortingDirectionEnum;
  nulls: SortingNullsPositionEnum;
}

/**
 * Применяет последовательность сортировок к билдеру запроса
 *
 * Если сортировки применяются к разным таблицам, то следует передать
 * alias равный '', и включить название таблицы в поле field каждой сортировки
 *
 * @param queryBuilder - билдер запроса
 * @param alias - алиас таблицы
 * @param sortings - последовательность сортировок
 */
export function applyBasicSortings<Entity>(
  queryBuilder: SelectQueryBuilder<Entity>,
  alias: string,
  sortings?: BasicSorting[],
) {
  if (!sortings || !sortings.length) {
    return;
  }

  for (const sortingElement of sortings) {
    applyBasicSorting(queryBuilder, alias, sortingElement);
  }
}

/**
 * Применяет сортировку к билдеру запроса
 *
 * @param queryBuilder - билдер запроса
 * @param alias - алиас таблицы
 * @param sorting - параметры сортировки
 */
export function applyBasicSorting<Entity>(
  queryBuilder: SelectQueryBuilder<Entity>,
  alias: string,
  sorting: BasicSorting,
) {
  const { field, direction, nulls } = sorting;
  queryBuilder.addOrderBy(
    alias ? `${alias}.${field}` : field,
    direction,
    nulls,
  );
}
