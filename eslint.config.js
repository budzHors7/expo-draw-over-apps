const baseConfig = require('expo-module-scripts/eslint.config.base');

module.exports = [
  {
    ignores: ['build/**'],
  },
  ...baseConfig,
  {
    files: ['src/**/*.{js,ts,tsx}'],
    rules: {
      'import/order': 'off',
      'prettier/prettier': 'off',
      'react-hooks/static-components': 'off',
    },
  },
];
