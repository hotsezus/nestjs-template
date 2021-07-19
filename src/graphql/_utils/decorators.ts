import { Extensions, Field, ID } from '@nestjs/graphql';
import { FieldOptions } from '@nestjs/graphql/dist/decorators/field.decorator';

export function IdField(options?: FieldOptions): PropertyDecorator {
  return Field(() => ID, options);
}

export function IdsField(options?: FieldOptions): PropertyDecorator {
  return Field(() => [ID], options);
}
