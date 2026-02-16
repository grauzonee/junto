const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js", "json"],
    testMatch: ["**/*.test.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    coverageReporters: [
        "json-summary",
        "text",
        "lcov"
    ],
    setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"]
};
