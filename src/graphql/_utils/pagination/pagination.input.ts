import { Field, InputType, Int } from '@nestjs/graphql';

@InputType({ description: 'Данные пагинации' })
export class PaginationInput {
  @Field((type) => Int, { nullable: true })
  page?: number;

  @Field((type) => Int, { nullable: true })
  onePage?: number;
}
