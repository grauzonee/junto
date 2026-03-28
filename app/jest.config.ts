const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    // The shared test bootstrap starts an in-memory Mongo instance and seeds data.
    testTimeout: 30000,
    moduleFileExtensions: ["ts", "js", "json"],
    testMatch: ["**/*.test.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@tests/(.*)$": "<rootDir>/tests/$1"
    },
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    coverageReporters: [
        "json-summary",
        "text",
        "lcov"
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/src/tests/",
        "/src/seeders/"
    ],
    setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"]
};
