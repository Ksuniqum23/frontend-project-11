import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

// Настройка пути для FlatCompat
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
});

export default [
  // Игнорируем папку сборки
  {
    ignores: ['dist/', 'webpack.config.js'],
  },

  // Общие правила для всех JS файлов
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      'no-console': 'off',       // можно выводить в консоль
      semi: 'off',               // отключаем проверку точек с запятой
    },
  },

  // Подключаем Airbnb-base через FlatCompat
  ...compat.extends('airbnb-base'),

  // Дополнительные правила проекта
  {
    rules: {
      'no-underscore-dangle': ['error', { allow: ['__filename', '__dirname'] }],
      'import/extensions': ['error', 'ignorePackages', { js: 'always' }],
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
];
