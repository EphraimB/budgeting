import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // If you have a setup file, consider renaming it to a .ts extension

  // Add TypeScript support
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  testEnvironment: "jest-environment-jsdom",

  // You can add a resolver to handle imports for Next.js' pages, if necessary
  // moduleNameMapper: {
  //   '^@/pages/(.*)': '<rootDir>/pages/$1',
  // },

  // Include .ts and .tsx files in your tests
  moduleFileExtensions: ["ts", "tsx", "js"],

  // If you have custom typings
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json", // Point to your tsconfig specifically for tests if you have one
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
