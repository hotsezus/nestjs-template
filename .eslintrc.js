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
  plugins: ['import', 'simple-import-sort'],
  rules: {
    // Сортировка и группировка импортов и экспортов
    'simple-import-sort/imports': 1,
    'simple-import-sort/exports': 1,
    // Правила для импортов
    'import/first': 1,
    'import/newline-after-import': 1,
    'import/no-duplicates': 1,
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
        '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/no-mixed-operators': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/interface-name-prefix': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
      },
    },
  ],
};
