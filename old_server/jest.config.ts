import type { JestConfigWithTsJest } from 'ts-jest';
import { defaults } from 'jest-config';

const jestConfig: JestConfigWithTsJest = {
    ...defaults,
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(t|j)s$': [
            'ts-jest',
            {
                tsconfig: './tsconfig.test.json',
                useESM: true,
            },
        ],
    },
    moduleNameMapper: {
        '^(\\.\\.?\\/.+)\\.js$': '$1',
    },
};

export default jestConfig;
