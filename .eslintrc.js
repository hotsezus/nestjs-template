module.exports = {
  env: {
    node: true,
  },
  extends: [
    // Последовательность этих трех импортов обеспечивает возможность автоматически фиксить код через 'eslint --fix'
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  ignorePatterns: ['.eslintrc.js'],
  plugins: ['@typescript-eslint', 'import', 'simple-import-sort'],
  rules: {
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-mixed-operators': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    // Сортировка и группировка импортов и экспортов
    'simple-import-sort/imports': 1,
    'simple-import-sort/exports': 1,
    // Правила для импортов
    'import/first': 1,
    'import/newline-after-import': 1,
    'import/no-duplicates': 1,
  },
};
