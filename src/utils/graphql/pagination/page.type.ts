import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';

import { PaginationHeaderType } from './paginationHeader.type';

/**
 * Создаёт GraphQL-тип результата пагинируемого запроса
 * @param ItemType - тип элемента
 * @constructor
 */
export function PageType<Item>(ItemType: Type<Item>): any {
  @ObjectType({ isAbstract: true })
  class ItemPageType {
    @Field()
    header: PaginationHeaderType;

    @Field((type) => [ItemType])
    list: Item[];
  }

  return ItemPageType;
}
