import { isTruthy } from '@proscom/ui-utils';
import { Brackets, SelectQueryBuilder } from 'typeorm';

import { extractParameterNameValue, ParameterDef } from './builderWhere';

/**
 * Применяет к запросу условие на вхождение поисковой строки в одном из полей.
 * Использует SQL-оператор LIKE. При проверке совпадения не учитывает регистр.
 *
 * @param query - билдер запроса
 * @param columns - поля в которых производится поиск
 * @param parameter - объект, задающий имя и значение бинда
 */
export function andWhereSearch<E>(
  query: SelectQueryBuilder<E>,
  columns: string[],
  parameter: ParameterDef<string | undefined>,
) {
  const [parameterName, value] = extractParameterNameValue(parameter);
  if (value === undefined) return;

  const keywords = value.toLowerCase().split(' ').filter(isTruthy);
  for (let iWord = 0; iWord < keywords.length; iWord++) {
    const word = keywords[iWord];
    const wordParamName = parameterName + '_' + iWord;
    const wordParamValue = '%' + word.toLowerCase() + '%';
    const wordParam = {
      [wordParamName]: wordParamValue,
    };
    query.andWhere(
      new Brackets((qb) => {
        for (const column of columns) {
          qb.orWhere(`lower(${column}) like :${wordParamName}`, wordParam);
        }
      }),
    );
  }
}
