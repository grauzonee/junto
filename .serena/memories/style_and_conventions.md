# Style and Conventions

- Prefer small, focused changes and preserve existing local style.
- TypeScript project using CommonJS and strict-ish linting through ESLint 9 / typescript-eslint.
- Naming convention from AGENTS.md: `verbObject`.
- Model entry files should focus on schema definitions, indexes, toJSON transforms, plugin wiring, and imports of related helpers.
- Put model-specific logic next to the model as `hooks.ts`, `methods.ts`, `queries.ts`, `statics.ts`, `utils.ts`, or `validators.ts` following existing patterns.
- Shared cross-model helpers belong in `app/src/helpers/`.
- Tests should mirror structure: shared helpers in `app/tests/helpers/`, model-specific behavior in `app/tests/models/<model>/`.
- Do not use deprecated functions in new code.
- Do not recreate generated `.js` files in `app/src/` or `app/tests/`; build output belongs in `app/dist/`.