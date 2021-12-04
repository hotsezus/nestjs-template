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
