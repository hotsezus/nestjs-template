import { Type } from '@nestjs/common';
import { Constructor } from '@nestjs/common/utils/merge-with-values.util';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import {
  BasicSorting,
  SortingDirectionEnum,
  SortingNullsPositionEnum,
} from '../../../utils/queryBuilder/builderSort';
import { PaginationInput } from './pagination.input';

registerEnumType(SortingDirectionEnum, { name: 'SortingDirectionEnum' });

registerEnumType(SortingNullsPositionEnum, {
  name: 'SortingNullsEnum',
});

export interface PageInputInterface<Filter> {
  filter?: Filter;
  pagination?: PaginationInput;
}

/**
 * Создаёт класс инпута для пагинируемого запроса с фильтром
 * @param FilterClass - класс инпута для фильтра
 * @constructor
 */
export function PageInput<Filter>(FilterClass: Type<Filter>) {
  @InputType({ isAbstract: true })
  class PageInputClass implements PageInputInterface<Filter> {
    @Field((type) => FilterClass, { nullable: true })
    filter?: Filter;

    @Field((type) => PaginationInput, { nullable: true })
    pagination?: PaginationInput;
  }

  return PageInputClass as Constructor<PageInputInterface<Filter>>;
}

export interface SortingOptionsInputInterface<Property extends string>
  extends BasicSorting {
  field: Property;
}

export interface PageWithSortingInputInterface<Filter, Sorting> {
  filter?: Filter;
  sorting?: Sorting[];
  pagination?: PaginationInput;
}

/**
 * Создаёт класс инпута для параметра сортировки
 * @param SortingFieldsEnum - энумератор полей сортировки
 * @constructor
 */
export function SortingOptions<SortingFields extends string>(
  SortingFieldsEnum,
) {
  @InputType({ isAbstract: true })
  class SortOption {
    @Field(() => SortingFieldsEnum, { nullable: true })
    field?: SortingFields;
    @Field(() => SortingDirectionEnum, { nullable: true })
    direction: SortingDirectionEnum;
    @Field(() => SortingNullsPositionEnum, { nullable: true })
    nulls: SortingNullsPositionEnum;
  }
  return SortOption as Constructor<SortingOptionsInputInterface<SortingFields>>;
}

/**
 * Создаёт класс инпута для пагинируемого запроса с фильтром и сортировками
 * @param FilterClass - класс инпута для фильтра
 * @param SortingClass - класс инпута для сортировки
 * @constructor
 */
export function PageWithSortingInput<Filter, Sorting>(
  FilterClass: Type<Filter>,
  SortingClass?: Type<Sorting>,
) {
  @InputType({ isAbstract: true })
  class PageWithSortingInputClass
    implements PageWithSortingInputInterface<Filter, Sorting>
  {
    @Field((type) => FilterClass, { nullable: true })
    filter?: Filter;

    @Field((type) => [SortingClass], { nullable: true })
    sorting?: Sorting[];

    @Field((type) => PaginationInput, { nullable: true })
    pagination?: PaginationInput;
  }

  return PageWithSortingInputClass as Constructor<
    PageWithSortingInputInterface<Filter, Sorting>
  >;
}
