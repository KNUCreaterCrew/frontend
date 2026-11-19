import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const upper = ['@/app/*', '@/pages/*', '@/features/*', '@/entities/*']
const sliceInternals = ['@/pages/*/*', '@/features/*/*', '@/entities/*/*']

const layer = (files, banned) => ({
  files,
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: banned,
            message:
              '아래 층에서 위 층을 가져오지 않는다 (app > pages > features > entities > shared)',
          },
          { group: sliceInternals, message: 'slice 는 index.ts 로만 공개한다' },
        ],
      },
    ],
  },
})

const sliceOnly = (files) => ({
  files,
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: [{ group: sliceInternals, message: 'slice 는 index.ts 로만 공개한다' }] },
    ],
  },
})

export default tseslint.config(
  {
    ignores: ['dist', 'dist-mock', 'coverage', 'playwright-report', 'test-results'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-refresh': reactRefresh },
    rules: { 'react-refresh/only-export-components': ['error', { allowConstantExport: true }] },
  },
  {
    files: ['*.{js,ts}', 'e2e/**', 'config/**'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      'no-restricted-globals': ['error', { name: 'fetch', message: 'shared/api 의 http 를 쓴다' }],
    },
  },
  {
    files: ['src/shared/api/**', '**/*.test.*', 'e2e/**', 'mocks/**'],
    rules: { 'no-restricted-globals': 'off' },
  },
  sliceOnly(['src/**/*.{ts,tsx}']),
  layer(['src/shared/**'], upper),
  layer(['src/entities/**'], ['@/app/*', '@/pages/*', '@/features/*']),
  layer(['src/features/**'], ['@/app/*', '@/pages/*']),
  layer(['src/pages/**'], ['@/app/*']),
  sliceOnly(['src/shared/test/**']),
  prettier,
)
