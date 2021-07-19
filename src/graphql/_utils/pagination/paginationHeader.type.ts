import { Field, ObjectType } from '@nestjs/graphql';

/**
 * Заголовок пагинируемого запроса
 */
@ObjectType()
export class PaginationHeaderType {
  @Field()
  totalCount?: number;

  @Field()
  page?: number;

  @Field()
  onePage?: number;

  @Field()
  hasNext?: boolean;
}
