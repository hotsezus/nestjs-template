module.exports = {
  env: {
    node: true,
  },
  extends: ['prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  ignorePatterns: ['.eslintrc.js'],
  plugins: ['import', 'simple-import-sort', 'unused-imports'],
  rules: {
    // Сортировка и группировка импортов и экспортов
    'simple-import-sort/imports': 1,
    'simple-import-sort/exports': 1,
    // Правила для импортов
    'import/first': 1,
    'import/newline-after-import': 1,
    'import/no-duplicates': 1,
    'unused-imports/no-unused-imports': 1,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
      },
      extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
      plugins: ['@typescript-eslint', 'import', 'simple-import-sort'],
      rules: {
        // В процессе разработки часто приходится заводить неиспользуемые переменные
        '@typescript-eslint/no-unused-vars': 0,
        // Prettier расставляет скобочки, поэтому при базовых знаниях двоичной логики логические выражения не должны вызывать проблем
        '@typescript-eslint/no-mixed-operators': 0,
        // Периодически приходится писать any, чтобы экономить время
        '@typescript-eslint/no-explicit-any': 0,
        // Лишние типы это не страшно
        '@typescript-eslint/no-inferrable-types': 0,
        // Это для нас не критично
        '@typescript-eslint/interface-name-prefix': 0,
        // Автоматическое выведение типов помогает писать меньше кода
        '@typescript-eslint/explicit-function-return-type': 0,
        // Автоматическое выведение типов помогает писать меньше кода
        '@typescript-eslint/explicit-module-boundary-types': 0,
        // Иногда приходится костылять, но делать это надо с комментариями
        '@typescript-eslint/ban-ts-comment': [
          1,
          {
            'ts-ignore': 'allow-with-description',
          },
        ],
        // Пустые интерфейсы могут быть в промежуточном состоянии кода
        '@typescript-eslint/no-empty-interface': 0,
        // Защищает от классической ошибки с if (0)
        '@typescript-eslint/strict-boolean-expressions': [
          1,
          {
            allowNumber: false,
            allowNullableBoolean: true,
            allowNullableString: true,
            allowAny: true,
          },
        ],
      },
    },
  ],
};
