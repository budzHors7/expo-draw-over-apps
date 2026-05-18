module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        babelConfig: false,
        tsconfig: {
          ignoreDeprecations: '6.0',
          jsx: 'react',
          module: 'commonjs',
          rootDir: '.',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__mocks__/react-native.js',
  },
};
