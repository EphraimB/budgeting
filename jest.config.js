export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
      '^.+\\.(t|j)s$': ['ts-jest', {
          tsconfig: './tsconfig.json',
          useESM: true
      }]
  },
    moduleNameMapper: {
      '^(\\.\\.?\\/.+)\\.js$': '$1',
    },
  };
  