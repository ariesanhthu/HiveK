// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '**/*.js',
      '**/*.d.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2024, // Match your tsconfig target
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // === .agents/rules/global/coding-standards.md ===
      // No `any`: Use explicit types, generics, or `unknown` with type guards
      '@typescript-eslint/no-explicit-any': 'warn',
      // Strict Null Checks: Always handle null and undefined explicitly
      // Explicit Return Types: All public methods and exported functions MUST declare explicit return types
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      // Immutability: Prefer readonly for VOs, Commands, Queries, Events
      '@typescript-eslint/prefer-readonly': 'warn',

      // === .agents/rules/global/error-handling.md ===
      // No Silent Exception Swallowing
      'no-empty': 'error',
      // Fail fast with explicit domain exceptions
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // === .agents/rules/global/security.md ===
      // NEVER output raw secrets in logs; use Winston instead
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // === Type safety ===
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      
      // === Code quality ===
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  // {
  //   files: ['**/*.ts'],
  //   ignores: ['src/infrastructure/auth/guarded-command-bus.ts'],
  //   rules: {
  //     // Prevent direct CommandBus imports (must use GuardedCommandBus)
  //     'no-restricted-imports': ['error', {
  //       patterns: [{
  //         group: ['@nestjs/cqrs'],
  //         importNames: ['CommandBus'],
  //         message: 'Use GuardedCommandBus instead of CommandBus. Import from src/infrastructure/auth/guarded-command-bus.ts',
  //       }],
  //     }],
  //   },
  // },
);