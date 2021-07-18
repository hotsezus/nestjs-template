import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { tableAlias } from '../../../utils/queryBuilder/builderAlias';
import { andWhereSearch } from '../../../utils/queryBuilder/builderSearch';
import {
  applyBasicSortings,
  BasicSorting,
} from '../../../utils/queryBuilder/builderSort';
import {
  addSimpleWhereIns,
  addWhereInSubquery,
} from '../../../utils/queryBuilder/builderWhere';
import { User } from './user.entity';

/**
 * Возможные фильтры для запроса списка пользователей
 */
export interface UserFilter {
  /**
   * ID пользователей
   */
  ids?: number[];

  /**
   * ID пользователей, исключенных из выборки
   */
  exclude_ids?: number[] | null;

  /**
   * Текстовый поиск по полям 'login', 'email', 'name' пользователя
   */
  search?: string;

  /**
   * ID создателей
   */
  creator_user_ids?: number[];
}

/**
 * Пример сервиса для построения запроса на список пользователей
 */
@Injectable()
export class UserQueryService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  /**
   * Создаёт билдер запроса и применяет к нему фильтры и сортировки
   */
  createBaseQuery(
    alias = 'users',
    filter?: UserFilter,
    sortings?: BasicSorting[],
  ) {
    const queryBuilder = this.usersRepo.createQueryBuilder(alias);
    this.applyFilters(queryBuilder, alias, filter);
    applyBasicSortings(queryBuilder, alias, sortings);

    // По умолчанию применяем сортировку по имени
    const users = tableAlias(alias);
    queryBuilder.addOrderBy(users.t('name'));

    return queryBuilder;
  }

  /**
   * Применяет к билдеру запроса набор фильтров
   */
  applyFilters(
    queryBuilder: SelectQueryBuilder<User>,
    alias = 'users',
    filter?: UserFilter,
  ) {
    const { ids, exclude_ids, search, creator_user_ids } =
      filter || ({} as UserFilter);

    const users = tableAlias(alias);

    andWhereSearch(
      queryBuilder,
      [users.t('login'), users.t('email'), users.t('name')],
      users.p({
        search,
      }),
    );

    addSimpleWhereIns(
      queryBuilder,
      users.pp({
        [users.t('id')]: {
          ids,
        },
      }),
    );

    if (exclude_ids) {
      const paramName = users.a('exclude_ids');
      queryBuilder.andWhere(`${users.t('id')} not in (:...${paramName})`, {
        [paramName]: exclude_ids,
      });
    }

    // Это не самое эффективное решение для фильтра по creator_user_id,
    // оно тут приведено для демонстрации того,
    // как делать условия на присоединенные сущности через подзапрос
    if (creator_user_ids) {
      const creatorUser = tableAlias(users.a('creator_user'));

      const subQuery = this.usersRepo
        .createQueryBuilder(creatorUser.n)
        .select(`distinct ${creatorUser.t('id')}`);

      addSimpleWhereIns(
        subQuery,
        users.pp({
          [creatorUser.t('id')]: {
            creator_user_ids,
          },
        }),
      );

      addWhereInSubquery(queryBuilder, users.t('id'), subQuery);
    }
  }
}
