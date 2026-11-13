import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules', 'scripts'] },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser, ecmaVersion: 2022, sourceType: 'module',
      globals: { window: 'readonly', document: 'readonly', navigator: 'readonly', console: 'readonly', requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly', performance: 'readonly', AudioContext: 'readonly', localStorage: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', HTMLElement: 'readonly', HTMLCanvasElement: 'readonly', KeyboardEvent: 'readonly', MouseEvent: 'readonly', PointerEvent: 'readonly', Event: 'readonly', AudioBuffer: 'readonly', GainNode: 'readonly', AudioNode: 'readonly', OscillatorNode: 'readonly', BiquadFilterNode: 'readonly', AudioParam: 'readonly', WebGLRenderingContext: 'readonly', URL: 'readonly', Image: 'readonly', fetch: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', Element: 'readonly', DOMException: 'readonly', AudioContextState: 'readonly', Document: 'readonly', EventListener: 'readonly', Node: 'readonly', React: 'readonly', JSX: 'readonly' } },
    plugins: { '@typescript-eslint': tseslint, 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
]
