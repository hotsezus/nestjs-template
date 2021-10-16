import { ParameterDef } from './builderWhere';

export interface TableAliasUtils {
  /**
   * Значение алиаса
   */
  n: string;
  /**
   * Добавляет алиас для имени поля
   *
   * @param field - имя поля
   * @example
   * t('id') // alias.id
   */
  t: (field: string) => string;
  /**
   * Добавляет алиас для имени параметра
   *
   * @param field - имя параметра
   * @example
   * a('id') // alias_id
   */
  a: (field: string) => string;
  /**
   * Добавляет алиас определению параметра
   *
   * @param params - определение параметра
   * @example
   * p({ id }) // { alias_id: id }
   */
  p: <T>(params: ParameterDef<T>) => ParameterDef<T>;
  /**
   * Добавляет алиасы параметрам для использования в addSimpleWhereIns
   *
   * @param params - параметры для addSimpleWhereIns
   * @example
   * pp({ field: { id } }) // { field: { alias_id: id } }
   */
  pp: <Params extends { [field: string]: ParameterDef<any> }>(
    params: Params,
  ) => {
    [Field in keyof Params]: Params[Field] extends ParameterDef<infer T>
      ? ParameterDef<T>
      : never;
  };
}

export function tableAlias<Alias extends string>(
  alias: Alias,
): TableAliasUtils {
  const t = (field: string) => alias + '.' + field;
  const a = (field: string) => alias + '_' + field;

  const p = <T>(params: ParameterDef<T>) => {
    const result = {};
    for (const key of Object.keys(params)) {
      result[alias + '_' + key] = params[key];
    }
    return result as ParameterDef<T>;
  };

  const pp = <Params extends { [field: string]: ParameterDef<any> }>(
    params: Params,
  ) => {
    const result = {};
    for (const field of Object.keys(params)) {
      result[field] = p(params[field]);
    }
    return result as {
      [Field in keyof Params]: Params[Field] extends ParameterDef<infer T>
        ? ParameterDef<T>
        : never;
    };
  };

  return {
    n: alias,
    t,
    a,
    p,
    pp,
  };
}
