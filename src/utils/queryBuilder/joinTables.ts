/**
 * Объединяет два массива объектов по заданному условию так,
 * как будто это FULL JOIN из SQL
 *
 * Вызывает функцию condition для каждой пары объектов `(a,b)`
 * из переданных таблиц. Если condition выполняется,
 * то добавляет в результат объединение двух объектов `{...a, ...b}`
 *
 * Если joinType равен LEFT, то также добавляет в результат объекты левой таблицы,
 * не имеющие ни одного совпадения
 * Если joinType равен RIGHT, то также добавляет в результат объекты правой таблицы,
 * не имеющие ни одного совпадения
 * Если joinType равен FULL, то также добавляет в результат объекты левой и правой таблиц,
 * не имеющие ни одного совпадения
 *
 * @param joinType - тип объединения таблиц
 * @param tableOne - левый массив объектов
 * @param tableTwo - правый массив объектов
 * @param condition - функция, определяющая условие джоина
 * @returns table - результат джоина
 */
export function joinTables<T, U>(
  joinType: 'LEFT' | 'RIGHT' | 'INNER' | 'FULL',
  tableOne: T[],
  tableTwo: U[],
  condition: (tableOneItem: T, tableTwoItem: U) => boolean,
): Partial<T & U>[];

/**
 * Объединяет два массива объектов по заданному условию так,
 * как будто это FULL JOIN из SQL
 *
 * Вызывает функцию condition для каждой пары объектов `(a,b)`
 * из переданных таблиц. Если condition выполняется,
 * то вызывает функцию merge и сохраняет её возвращаемое значение
 * в результат
 *
 * Если joinType равен LEFT, то также добавляет в результат объекты левой таблицы,
 * не имеющие ни одного совпадения
 * Если joinType равен RIGHT, то также добавляет в результат объекты правой таблицы,
 * не имеющие ни одного совпадения
 * Если joinType равен FULL, то также добавляет в результат объекты левой и правой таблиц,
 * не имеющие ни одного совпадения
 *
 * @param joinType - тип объединения таблиц
 *
 * @param tableOne - левый массив объектов
 * @param tableTwo - правый массив объектов
 * @param condition - функция, определяющая условие джоина
 * @param merge - функция, объединяющая два объекта
 * @returns table - результат джоина
 */
export function joinTables<T, U, Res = Partial<T & U>>(
  joinType: 'LEFT' | 'RIGHT' | 'INNER' | 'FULL',
  tableOne: T[],
  tableTwo: U[],
  condition: (tableOneItem: T, tableTwoItem: U) => boolean,
  merge: (tableOneItem: T, tableTwoItem: U) => Res,
): Res[];

export function joinTables<T, U, Res = Partial<T & U>>(
  joinType: 'LEFT' | 'RIGHT' | 'INNER' | 'FULL',
  tableOne: T[],
  tableTwo: U[],
  condition: (TableOneItem: T, TableTwoItem: U) => boolean,
  merge: (TableOneItem: T | undefined, TableTwoItem: U | undefined) => Res = (
    TableOneItem,
    TableTwoItem,
  ) =>
    ({
      ...TableOneItem,
      ...TableTwoItem,
    } as unknown as Res),
) {
  const isLeft = joinType === 'LEFT';
  const isRight = joinType === 'RIGHT';
  const isFull = joinType === 'FULL';
  const result: Res[] = [];

  for (const itemOne of tableOne) {
    let found = false;
    for (const itemTwo of tableTwo) {
      if (condition(itemOne, itemTwo)) {
        result.push(merge(itemOne, itemTwo));
        found = true;
      }
    }
    if (!found && (isLeft || isFull)) {
      result.push(merge(itemOne, undefined));
    }
  }

  for (let j = 0; j < tableTwo.length; j++) {
    let found = false;
    for (let i = 0; i < tableOne.length; i++) {
      if (condition(tableOne[i], tableTwo[j])) {
        found = true;
      }
    }
    if (!found && (isRight || isFull)) {
      result.push(merge(undefined, tableTwo[j]));
    }
  }

  return result;
}
