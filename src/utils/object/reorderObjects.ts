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
