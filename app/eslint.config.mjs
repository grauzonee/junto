// @ts-check

import { fileURLToPath } from "node:url";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

const globals = {
    afterAll: "readonly",
    afterEach: "readonly",
    beforeAll: "readonly",
    beforeEach: "readonly",
    describe: "readonly",
    expect: "readonly",
    jest: "readonly",
    process: "readonly",
    it: "readonly"
};

export default tseslint.config(
    {
        ignores: [
            "coverage/**",
            "dist/**"
        ],
        linterOptions: {
            reportUnusedDisableDirectives: "error"
        }
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    tseslint.configs.strict,
    tseslint.configs.recommendedTypeChecked,
    {
        files: ["src/**/*.ts", "tests/**/*.ts"],
        languageOptions: {
            globals,
            parserOptions: {
                projectService: true,
                tsconfigRootDir
            }
        },
        rules: {
            '@typescript-eslint/await-thenable': 'off',
            '@typescript-eslint/no-confusing-void-expression': 'off',
            '@typescript-eslint/no-deprecated': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/prefer-nullish-coalescing': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/unbound-method': 'off',
            'no-console': 'error'
        }
    },
    {
        files: ["src/scripts/**/*.ts", "src/seeders/**/*.ts"],
        rules: {
            'no-console': 'off'
        }
    }
);
