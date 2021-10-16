// We need Function type here
/* eslint-disable @typescript-eslint/ban-types*/

import {
  CallHandler,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BatchLoadFn } from 'dataloader';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { transformValuesTo } from './typeorm';
import DataLoader = require('dataloader');

/**
 * Переупорядочивает массив объектов в соответствии с массивом ключей
 * В случае дубликатов остается последний
 */
export function reorderObjects<ObjectType, Key, Value = ObjectType | null>(
  data: readonly ObjectType[],
  ids: readonly Key[],
  key: (obj: ObjectType) => Key,
  select: (obj: ObjectType | null) => Value = (o) => o as unknown as Value,
): Value[] {
  const map = new Map<Key, Value>();
  for (const model of data) {
    map.set(key(model), select(model));
  }
  return ids.map((id) => map.get(id) || select(null));
}

/**
 * Переупорядочивает массив объектов в соответствии с массивом ключей
 * Группирует объекты с одинаковыми ключами в массив
 */
export function regroupObjects<ObjectType, Key, Value = ObjectType>(
  data: readonly ObjectType[],
  ids: readonly Key[],
  key: (obj: ObjectType) => Key,
  select: (obj: ObjectType) => Value = (o) => o as unknown as Value,
): Value[][] {
  const map = new Map<Key, Value[]>();
  for (const model of data) {
    const modelKey = key(model);
    const group = map.get(modelKey);
    const value = select(model);
    if (group) {
      group.push(value);
    } else {
      map.set(modelKey, [value]);
    }
  }
  return ids.map((id) => map.get(id) || []);
}

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

/**
 * Менеджер даталоадеров для сущностей TypeORM
 */
export class TypeormDataLoaders {
  entityLoaders = new Map<Function, DataLoader<any, any>>();
  relationLoaders = new Map<string, DataLoader<any, any>>();
  builders = new Map<Function, string>();
  buildersCount = 0;
  loaders = new Map<Function, DataLoader<any, any>>();

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * Возвращает или создает загрузчик сущностей по id
   */
  getEntityLoader<T extends { id: any }>(
    Type,
    connection?: string,
  ): DataLoader<any, T> {
    let loader = this.entityLoaders.get(Type);
    if (!loader) {
      const repoToken: string | Function = getRepositoryToken(Type, connection);
      const repository = this.moduleRef.get<Repository<T>>(
        repoToken instanceof Function ? repoToken.name : repoToken,
        {
          strict: false,
        },
      );
      loader = new DataLoader(async (ids: any[]) => {
        const result = await repository.findByIds(ids);
        return reorderObjects(result, ids, (m) => m.id);
      });
      this.entityLoaders.set(Type, loader);
    }

    return loader;
  }

  /**
   * Возвращает или создает загрузчик сущностей по произвольному полю
   * Оставляет только одну сущность на каждый запрос
   */
  getRelationLoader<T>(
    repository: Repository<T>,
    foreignKey: string,
    queryBuilder?: (
      query: SelectQueryBuilder<T>,
    ) => Promise<SelectQueryBuilder<T>> | SelectQueryBuilder<T>,
  ): DataLoader<any, T> {
    const builderHash = this.getBuilderHash(queryBuilder);
    const hash =
      repository.metadata.name + '-' + foreignKey + '-' + builderHash;
    let loader = this.relationLoaders.get(hash);
    if (!loader) {
      const builder = async (ids: any[]) => {
        const queryIds = transformValuesTo(repository, foreignKey, ids);
        const query = repository
          .createQueryBuilder('t')
          .andWhere(`t.${foreignKey} IN (:...ids)`, {
            ids: queryIds,
          });

        const query2 = queryBuilder ? await queryBuilder(query) : query;
        const result = await query2.getMany();
        return reorderObjects(result, ids, (m) => m[foreignKey]);
      };
      loader = new DataLoader<any, T | null>(builder);
      this.relationLoaders.set(hash, loader);
    }

    return loader;
  }

  /**
   * Возвращает или создает загрузчик сущностей по произвольному полю
   * Созданный загрузчик возвращает массив сущностей, подходящих под условие
   */
  getManyRelationLoader<T>(
    repository: Repository<T>,
    foreignKey: string,
    queryBuilder?: (
      query: SelectQueryBuilder<T>,
    ) => Promise<SelectQueryBuilder<T>> | SelectQueryBuilder<T>,
  ): DataLoader<any, T[]> {
    const builderHash = this.getBuilderHash(queryBuilder);
    const hash =
      repository.metadata.name + '-' + foreignKey + '-many' + '-' + builderHash;
    let loader = this.relationLoaders.get(hash);
    if (!loader) {
      const builder = async (ids: any[]) => {
        const queryIds = transformValuesTo(repository, foreignKey, ids);
        const query = repository
          .createQueryBuilder('t')
          .andWhere(`t.${foreignKey} IN (:...ids)`, {
            ids: queryIds,
          });

        const query2 = queryBuilder ? await queryBuilder(query) : query;
        const result = await query2.getMany();
        return regroupObjects(result, ids, (m) => m[foreignKey]);
      };
      loader = new DataLoader<any, T[]>(builder);
      this.relationLoaders.set(hash, loader);
    }

    return loader;
  }

  /**
   * Возвращает или создает загрузчик количества сущностей по произвольному полю
   * Созданный загрузчик возвращает количество сущностей, подходящих под условие
   */
  getManyCountRelationLoader<T>(
    repository: Repository<T>,
    foreignKey: string,
    queryBuilder?: (
      query: SelectQueryBuilder<T>,
    ) => Promise<SelectQueryBuilder<T>> | SelectQueryBuilder<T>,
  ): DataLoader<any, number> {
    const builderHash = this.getBuilderHash(queryBuilder);
    const hash =
      repository.metadata.name + '-' + foreignKey + '-manyCount-' + builderHash;
    let loader = this.relationLoaders.get(hash);
    if (!loader) {
      const builder = async (ids: any[]) => {
        const queryIds = transformValuesTo(repository, foreignKey, ids);
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
      loader = new DataLoader<any, number>(builder);
      this.relationLoaders.set(hash, loader);
    }

    return loader;
  }

  /**
   * Возвращает или создает загрузчик сущностей по произвольному полю
   * Созданный загрузчик возвращает массив сущностей, подходящих под условие
   */
  getManyToManyRelationLoader<T>(
    repository: Repository<T>,
    foreignKey: string,
    joinKey: string,
    queryBuilder?: (
      query: SelectQueryBuilder<T>,
    ) => Promise<SelectQueryBuilder<T>> | SelectQueryBuilder<T>,
  ): DataLoader<any, T[]> {
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
      const builder = async (ids: any[]) => {
        const queryIds = transformValuesTo(repository, foreignKey, ids);
        const query = repository
          .createQueryBuilder('t')
          .innerJoinAndMapOne(`t.${joinKey}`, `t.${joinKey}`, 't1')
          .andWhere(`t.${foreignKey} IN (:...ids)`, {
            ids: queryIds,
          });

        const query2 = queryBuilder ? await queryBuilder(query) : query;
        const result = await query2.getMany();
        return regroupObjects(result, ids, (m) => m[foreignKey]);
      };
      loader = new DataLoader<any, T[]>(builder);
      this.relationLoaders.set(hash, loader);
    }

    return loader;
  }

  /**
   * Создает загрузчик с произвольной функцией загрузки
   */
  getLoader<K, T>(builder: BatchLoadFn<K, T>): DataLoader<K, T> {
    let loader = this.loaders.get(builder);
    if (!loader) {
      loader = new DataLoader(builder);
      this.loaders.set(builder, loader);
    }

    return loader;
  }

  memInvoke = createLodashMemoizer(
    <K, T>(fn: BatchLoadCreator<K, T>, ...args) => fn(...args),
  );

  /**
   * Создает загрузчик с произвольной функцией загрузки
   */
  getLoaderArgs<K, T>(
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
  getBuilderHash(builder: Function | null | undefined) {
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

/**
 * Декоратор для аргумента резолвера, позволяющий получить даталоадер для заданной сущности
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const InjectEntityLoader = (Entity: Function, connection?: string) =>
  createParamDecorator((data_, context: ExecutionContext) => {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const ctx = graphqlExecutionContext.getContext();
    if (ctx.typeormDataLoaders) {
      const dl: TypeormDataLoaders = ctx.typeormDataLoaders;
      return dl.getEntityLoader(Entity, connection);
    }
    throw new Error(
      `Variable 'typeormDataLoaders' is not found in the GraphQL context`,
    );
  })();

/**
 * Декоратор для аргумента резолвера, позволяющий получить сервис даталоадеров
 */
export const InjectTypeormDataLoaders = () => {
  return createParamDecorator((data_, context: ExecutionContext) => {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const ctx = graphqlExecutionContext.getContext();
    if (ctx.typeormDataLoaders) {
      return ctx.typeormDataLoaders;
    }
    throw new Error(
      `Variable 'typeormDataLoaders' is not found in the GraphQL context`,
    );
  })();
};

/**
 * Интерцептор, добавляющий переменную dataLoaders в GraphQL-контекст
 */
@Injectable()
export class TypeormDataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (ctx && !ctx.typeormDataLoaders) {
      ctx.typeormDataLoaders = new TypeormDataLoaders(this.moduleRef);
    }
    return next.handle();
  }
}
