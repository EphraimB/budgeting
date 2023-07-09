import type { JestConfigWithTsJest } from 'ts-jest'
import { defaults } from 'jest-config';

const jestConfig: JestConfigWithTsJest = {
    ...defaults,
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', {
            tsconfig: './tsconfig.json',
            useESM: true,
            diagnostics: {
                ignoreCodes: [1343]
            },
            astTransformers: {
                before: [
                    {
                        path: 'node_modules/ts-jest-mock-import-meta',  // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
                        options: { metaObjectReplacement: { url: './' } }
                    }
                ]
            }
        }]
    },
    moduleNameMapper: {
        '^(\\.\\.?\\/.+)\\.js$': '$1'
    }
};

export default jestConfig;