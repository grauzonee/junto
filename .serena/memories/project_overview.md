# Project Overview

- Repository: `junto`.
- Purpose: backend service for a social events app where users create and attend events, manage profiles, RSVP, and search/discover events.
- Primary app lives in `app/`.
- Stack: TypeScript, Node.js, Express 5, Mongoose 8, Jest 30, ESLint 9, Zod, Redis, Winston.
- Main source folders: `app/src/routes`, `app/src/requests`, `app/src/services`, `app/src/models`, `app/src/schemas`, `app/src/helpers`, `app/src/middlewares`, `app/src/config`.
- Tests mirror source areas under `app/tests/` with request, middleware, helper, model, service, schema, openapi, and seeder tests.