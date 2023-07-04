import { defaults } from 'jest-config';

export default async () => {
  return {
    ...defaults,
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
  };
};
