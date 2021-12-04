// Здесь нужен тип Function
/* eslint-disable @typescript-eslint/ban-types */

import { Constructor } from '@nestjs/common/utils/merge-with-values.util';
import { ModuleRef } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BatchLoadFn } from 'dataloader';
import { isEqual } from 'lodash';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { regroupObjects } from '../../object/regroupObjects';
import { reorderObjects } from '../../object/reorderObjects';
import { transformValuesTo } from '../../typeorm';
import DataLoader = require('dataloader');

export type BatchLoadCreator<K, T> = (...args) => BatchLoadFn<K, T>;

function createLodashMemoizer<Args extends any[], Res>(
  fn: (...args: Args) => Res,
) {
  const memo: { args: Args; value: Res }[] = [];
  return (...args: Args) => {
    const memorized = memo.find((mem) => isEqual(mem.args, args));
    if (memorized) {
      return memorized.value;
    }
    const value = fn(...args);
    memo.push({ args, value });
    return value;
  };
}

type RequiredField<T, Field extends keyof T> = Exclude<
  T[Field],
  null | undefined
>;

/**
 * Менеджер даталоадеров для сущностей TypeORM
 */
export class TypeormDataLoaders {
  protected entityLoaders = new Map<Function, DataLoader<any, any>>();
  protected relationLoaders = new Map<string, DataLoader<any, any>>();
  protected builders = new Map<Function, string>();
  protected buildersCount = 0;
  protected loaders = new Map<Function, DataLoader<any, any>>();

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * Возвращает или создает загрузчик сущностей по id
   */
  public getEntityLoader<T extends { id: any }>(
    Type: Constructor<T>,
    connection?: string,
  ) {
    type ID = RequiredField<T, 'id'>;
    let loader = this.entityLoaders.get(Type);
    if (!loader) {
      const repoToken: string | Function = getRepositoryToken(Type, connection);
      const repository = this.moduleRef.get<Repository<T>>(
        repoToken instanceof Function ? repoToken.name : repoToken,
        {
          strict: false,
        },
      );
      loader = new DataLoader<ID, T | null>(async (ids: readonly ID[]) => {
        const result = await repository.findByIds([...ids]);
        return reorderObjects(result, ids, (m) => m.id);
      });
      this.entityLoaders.set(Type, loader);
    }

    return loader as DataLoader<ID, T | null>;
  }

  /**
   * Возвращает или создает загрузчик сущностей по произвольному полю
   * Оставляет только одну сущность на каждый запрос
   */
  public getRelationLoader<T, FK extends keyof T & string>(
    repository: Repository<T>,
    foreignKey: FK,
    queryBuilder?: (
      query: SelectQueryBuilder<T>,
    ) => Promise<SelectQueryBuilder<T>> | SelectQueryBuilder<T>,
  ) {
    type ID = RequiredField<T, FK>;
    const builderHash = this.getBuilderHash(queryBuilder);
    const hash =
      repository.metadata.name + '-' + foreignKey + '-' + builderHash;
    let loader = this.relationLoaders.get(hash);
    if (!loader) {
      const builder = async (ids: readonly ID[]) => {
        const queryIds = transformValuesTo(repository, foreignKey, ids);
        const query = repository
          .createQueryBuilder('t')
          .andWhere(`t.${foreignKey} IN (:...ids)`, {
            ids: queryIds,
          });

        const query2 = queryBuilder ? await queryBuilder(query) : query;
        const result = await query2.getMany();
        return reorderObjects(result, ids, (m) => m[foreignKey] as ID);
      };
      loader = new DataLoader<ID, T | null>(builder);
      this.relationLoaders.set(hash, loader);
    }

    return loader as DataLoader<ID, T | null>;
  }

  /**
   * Возвращает или создает загрузчик сущностей по произвольному полю
   * Созданный загрузчик возвращает массив сущностей, подходящих под условие
   */
  public getManyRelationLoader<T, FK extends string & keyof T>(
    repository: Repository<T>,
    foreignKey: FK,
    queryBuilder?: (
      query: SelectQueryBuilder<T>,
    ) => Promise<SelectQueryBuilder<T>> | SelectQueryBuilder<T>,
  ) {
    type ID = RequiredField<T, FK>;
    const builderHash = this.getBuilderHash(queryBuilder);
    const hash =
      repository.metadata.name + '-' + foreignKey + '-many' + '-' + builderHash;
    let loader = this.relationLoaders.get(hash);
    if (!loader) {
      const builder = async (ids: readonly ID[]) => {
        const queryIds = transformValuesTo(repository, foreignKey, ids);
        const query = repository
          .createQueryBuilder('t')
          .andWhere(`t.${foreignKey} IN (:...ids)`, {
            ids: queryIds,
          });

        const query2 = queryBuilder ? await queryBuilder(query) : query;
        const result = await query2.getMany();
        return regroupObjects(result, ids, (m) => m[foreignKey] as ID);
      };
      loader = new DataLoader<ID, T[]>(builder);
      this.relationLoaders.set(hash, loader);
    }

    return loader as DataLoader<ID, T | null>;
  }

  /**
   * Возвращает или создает загрузчик количества сущностей по произвольному полю
   * Созданный загрузчик возвращает количество сущностей, подходящих под условие
   */
  public getManyCountRelationLoader<T, FK extends string & keyof T>(
    repository: Repository<T>,
    foreignKey: FK,
    queryBuilder?: (
      query: SelectQueryBuilder<T>,
    ) => Promise<SelectQueryBuilder<T>> | SelectQueryBuilder<T>,
  ) {
    type ID = RequiredField<T, FK>;
    const builderHash = this.getBuilderHash(queryBuilder);
    const hash =
      repository.metadata.name + '-' + foreignKey + '-manyCount-' + builderHash;
    let loader = this.relationLoaders.get(hash);
    if (!loader) {
      const builder = async (ids: readonly ID[]) => {
        const queryIds = transformValuesTo(repository, foreignKey, ids as ID[]);
        const query = repository
          .createQueryBuilder('t')
          .select(`t.${foreignKey}`, 'item_id')
          .addSelect('count(*)', 'count')
          .andWhere(`t.${foreignKey} IN (:...ids)`, {
            ids: queryIds,
          })
          .groupBy(`t.${foreignKey}`);

        const query2 = queryBuilder ? await queryBuilder(query) : query;
        const result = (await query2.getRawMany()) as {
          item_id: any;
          count: number;
        }[];
        return reorderObjects(
          result,
          ids,
          (m) => m.item_id,
          (m) => m?.count || 0,
        );
      };
      loader = new DataLoader<ID, number>(builder);
      this.relationLoaders.set(hash, loader);
    }

    return loader as DataLoader<ID, number>;
  }

  /**
   * Возвращает или создает загрузчик сущностей по произвольному полю
   * Созданный загрузчик возвращает массив сущностей, подходящих под условие
   */
  public getManyToManyRelationLoader<T, FK extends string & keyof T>(
    repository: Repository<T>,
    foreignKey: FK,
    joinKey: keyof T & string,
    queryBuilder?: (
      query: SelectQueryBuilder<T>,
    ) => Promise<SelectQueryBuilder<T>> | SelectQueryBuilder<T>,
  ) {
    type ID = RequiredField<T, FK>;
    const builderHash = this.getBuilderHash(queryBuilder);
    const hash =
      repository.metadata.name +
      '-' +
      foreignKey +
      '-' +
      joinKey +
      '-many-' +
      builderHash;
    let loader = this.relationLoaders.get(hash);
    if (!loader) {
      const builder = async (ids: readonly ID[]) => {
        const queryIds = transformValuesTo(repository, foreignKey, ids);
        const query = repository
          .createQueryBuilder('t')
          .innerJoinAndMapOne(`t.${joinKey}`, `t.${joinKey}`, 't1')
          .andWhere(`t.${foreignKey} IN (:...ids)`, {
            ids: queryIds,
          });

        const query2 = queryBuilder ? await queryBuilder(query) : query;
        const result = await query2.getMany();
        return regroupObjects(result, ids, (m) => m[foreignKey] as ID);
      };
      loader = new DataLoader<ID, T[]>(builder);
      this.relationLoaders.set(hash, loader);
    }

    return loader as DataLoader<ID, T[]>;
  }

  /**
   * Создает загрузчик с произвольной функцией загрузки
   */
  public getLoader<K, T>(builder: BatchLoadFn<K, T>): DataLoader<K, T> {
    let loader = this.loaders.get(builder);
    if (!loader) {
      loader = new DataLoader(builder);
      this.loaders.set(builder, loader);
    }

    return loader;
  }

  protected memInvoke = createLodashMemoizer(
    <K, T>(fn: BatchLoadCreator<K, T>, ...args) => fn(...args),
  );

  /**
   * Создает загрузчик с произвольной функцией загрузки
   */
  public getLoaderArgs<K, T>(
    builderCreator: BatchLoadCreator<K, T>,
    ...args
  ): DataLoader<K, T> {
    const builder = this.memInvoke(builderCreator, ...args);
    let loader = this.loaders.get(builder);
    if (!loader) {
      loader = new DataLoader(builder);
      this.loaders.set(builder, loader);
    }

    return loader;
  }

  /**
   * Возвращает строковый хеш переданной функции
   */
  protected getBuilderHash(builder: Function | null | undefined) {
    if (!builder) return '';
    const hash = this.builders.get(builder);
    if (!hash) {
      const id = this.buildersCount + 1;
      this.buildersCount++;
      this.builders.set(builder, String(id));
      return id;
    }
    return hash;
  }
}
