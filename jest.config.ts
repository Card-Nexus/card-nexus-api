import type { Config } from "jest";

const config: Config = {
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/config",
    "server.js",
    "app.js",
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "**/models/**/*.ts",
    "**/routes/**/*.ts",
    "**/controllers/**/*.ts",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/jest.config.js",
  ],
  verbose: true,
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  clearMocks: true,
};

export default config;
