import { EntityMetadata, Repository, ValueTransformer } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { ApplyValueTransformers } from 'typeorm/util/ApplyValueTransformers';

// Возвращает метаданные столбца по имени поля в сущности
export function findPropertyMetadata<E>(
  repositoryOrMetadata: Repository<E> | EntityMetadata,
  propertyName: string,
): ColumnMetadata | undefined {
  let metadata: EntityMetadata;
  if (repositoryOrMetadata instanceof Repository) {
    metadata = repositoryOrMetadata.metadata;
  } else {
    metadata = repositoryOrMetadata;
  }

  const property = metadata.columns.find(
    (column) => column.propertyName === propertyName,
  );
  if (!property) {
    throw new Error(
      `Could not find property '${propertyName}' in ${metadata.name} entity`,
    );
  }
  return property;
}
export function getPropertyTransformer<Entity>(
  repository: Repository<Entity>,
  propertyName: string,
): ValueTransformer | ValueTransformer[] | undefined {
  const ormColumn = findPropertyMetadata(repository, propertyName);
  if (!ormColumn) {
    return undefined;
  }
  return ormColumn.transformer;
}

function getTransformedValues(
  transformer: ValueTransformer | ValueTransformer[] | null | undefined,
  values: readonly any[],
): readonly any[] {
  if (transformer) {
    return values.map((value) =>
      ApplyValueTransformers.transformTo(transformer, value),
    );
  }
  return values;
}

export function transformValuesTo<Entity>(
  repository: Repository<Entity>,
  field: string,
  values: readonly any[],
) {
  const transformer = getPropertyTransformer(repository, field);
  return getTransformedValues(transformer, values);
}
