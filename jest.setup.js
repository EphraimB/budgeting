import { jest } from '@jest/globals';

jest.unstable_mockModule('fs', () => import('mock-fs'));
