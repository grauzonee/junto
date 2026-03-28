# AGENTS.md

## Overview

This file gives coding agents a quick operating guide for this repository.

- Repository: `junto`
- Primary app: `app/`
- Stack: TypeScript, Node.js, Express, Mongoose, Jest

## Goals

Describe the primary product and engineering goals here.

- Goal 1: `TODO`
- Goal 2: `TODO`
- Goal 3: `TODO`

## Repository Layout

```text
.
├── app/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.build.json
├── docs/
├── docker-compose.yml
└── README.md
```

## Working Agreements

- Prefer small, focused changes.
- Do not revert unrelated local changes.
- Keep changes aligned with existing code style and patterns.
- Add or update tests when behavior changes.
- Prefer fixing root causes over patching symptoms.

## Setup

Run commands from `app/` unless noted otherwise.

```bash
npm install
```

## Common Commands

```bash
# Development
cd app && npm run dev

# Build
cd app && npm run build

# Tests
cd app && npm test

# Focused test run
cd app && npm test -- --config jest.config.ts --runInBand tests/requests/events.test.ts

# Lint
cd app && npm run lint
```

## Build Notes

- Production build output goes to `app/dist/`.
- The build uses `tsconfig.build.json`.
- Source and test-adjacent generated `.js` files should not be recreated in `app/src/` or `app/tests/`.

## Testing Expectations

- Add unit tests for helpers, middleware, and services when logic changes.
- Add request-level tests for endpoint behavior changes.
- Prefer targeted test runs while iterating.
- Run the most relevant tests before finishing work.

## Code Areas

### API and Routes

- Location: `app/src/routes/`
- Request handlers: `app/src/requests/`
- Services: `app/src/services/`

### Data Layer

- Models: `app/src/models/`
- Schemas and validation: `app/src/schemas/`

### Tests

- Request tests: `app/tests/requests/`
- Middleware tests: `app/tests/middlewares/`
- Helper tests: `app/tests/helpers/`
- Model tests: `app/tests/models/`
- Service tests: `app/tests/services/`

## Change Checklist

Before finishing a task, check:

- Behavior change is implemented.
- Relevant tests were added or updated.
- Build still succeeds.
- Relevant test suite passes.
- No accidental generated files were introduced outside `dist/`.

## PR Guidance

When opening a PR, include:

- What changed
- Why it changed
- User or developer impact
- Validation performed

## Known Caveats

- Jest should be run with `jest.config.ts`.
- Stale generated files can cause duplicate Jest config or mock issues if they appear outside `dist/`.
- There are duplicate `GET /` route registrations in `app/src/routes/event.ts`; review route order carefully when changing event listing behavior.

## Project-Specific Conventions

Fill in any conventions that agents should follow here.

- Naming: `TODO`
- Branching: `TODO`
- Review expectations: `TODO`
- Release process: `TODO`

## Contacts

Add project owners or team references here.

- Engineering owner: `TODO`
- Product owner: `TODO`
- Slack / docs / issue tracker: `TODO`
