import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import hooks from 'eslint-plugin-react-hooks'
import { fsdBoundaries } from './config/eslint/fsd.js'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'playwright-report', 'test-results', 'artifacts', 'doki'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': hooks },
    rules: { ...hooks.configs.recommended.rules },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { fsd: { rules: { boundaries: fsdBoundaries } } },
    rules: { 'fsd/boundaries': 'error' },
  },
  { files: ['**/*.js'], languageOptions: { globals: globals.node } },
)
