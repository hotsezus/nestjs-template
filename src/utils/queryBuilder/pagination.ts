import { tryNumber } from '@proscom/ui-utils';
import { SelectQueryBuilder } from 'typeorm';

/**
 * Информация о пагинации запроса
 */
export interface PaginationHeader {
  /**
   * Общее количество значений
   */
  totalCount: number;
  /**
   * Номер текущей страницы
   */
  page: number;
  /**
   * Количество элементов на странице
   */
  onePage: number;
  /**
   * Есть ли следующая страница
   */
  hasNext: boolean;
}

/**
 * Формирует объект пагинационной информации
 *
 * @param totalCount
 * @param skip
 * @param take
 */
export function getHeader({
  totalCount,
  skip,
  take,
}: {
  totalCount?: number;
  skip?: number;
  take?: number;
}): PaginationHeader {
  const _totalCount = tryNumber(totalCount, 0);
  const _skip = tryNumber(skip, 0);
  const _take = tryNumber(take, 0);

  return {
    totalCount: _totalCount,
    page: (_take > 0 ? Math.floor(_skip / _take) : 0) + 1,
    onePage: _take,
    hasNext: _skip + _take < _totalCount,
  };
}

/**
 * Выполняет переданный запрос page, имеющий пагинацию, и при необходимости
 * запрашивает общее количество значений
 *
 * @param query - билдер запроса
 * @param hasList - запрашивается ли список значений
 * @param hasHeader - запрашивается ли заголовок пагинации
 * @param options - параметры пагинации - skip и take
 */
export async function getPage<T>({
  query,
  hasList,
  hasHeader,
  options,
}: {
  query?: SelectQueryBuilder<any> | null;
  hasList?: boolean;
  hasHeader?: boolean;
  options: {
    skip?: number;
    take?: number;
  };
}) {
  let totalCount: number | undefined;
  let list: T[] | undefined;

  if (query) {
    if (hasList && hasHeader) {
      [list, totalCount] = await query.getManyAndCount();
    } else if (hasHeader) {
      totalCount = await query.getCount();
    } else if (hasList) {
      list = await query.getMany();
    }
  }

  const header = getHeader({
    totalCount,
    skip: options.skip,
    take: options.take,
  });

  return {
    header,
    list,
  };
}
