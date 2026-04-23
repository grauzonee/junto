# Suggested Commands

Run most project commands from `app/`.

- Install dependencies: `cd app && npm install`
- Dev server: `cd app && npm run dev`
- Build: `cd app && npm run build`
- Lint all: `cd app && npm run lint`
- Lint source: `cd app && npm run lint:src`
- Lint tests: `cd app && npm run lint:tests`
- Run all tests: `cd app && npm test`
- Focused Jest run: `cd app && npm test -- --config jest.config.ts --runInBand tests/requests/events.test.ts`
- CI tests: `cd app && npm run test:ci`
- Generate OpenAPI JSON: `cd app && npm run openapi`
- Build OpenAPI HTML: `cd app && npm run openapi:html`
- Generate docs: `cd app && npm run docs`
- Useful Darwin commands: `git status --short --branch`, `rg <pattern>`, `rg --files`, `find <path> -maxdepth <n> -type f`, `ls`, `sed -n '1,120p' <file>`.