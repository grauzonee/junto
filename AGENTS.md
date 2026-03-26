# AGENTS.md

This file is a working guide for Codex and other agents operating in this repository.

## Overview

Junto is a TypeScript/Express backend for a social events app. The API covers:

- authentication and profile management
- event CRUD, attendance, and RSVP flows
- category, interest, and event type listing
- geosearch for nearby events
- media upload/static serving

The codebase is organized in a fairly classic layered backend style:

- `routes` define endpoint wiring and middleware order
- `requests` contain HTTP handlers
- `services` contain business logic and database calls
- `models` define Mongoose schemas, validators, hooks, and query helpers
- `schemas/http` define Zod request validation

## Stack

- Runtime: Node.js
- Language: TypeScript with `strict` mode enabled
- Web framework: Express 5
- Database: MongoDB via Mongoose 8
- Validation: Zod
- Auth: JWT + bcrypt
- Logging: Winston with daily rotating log files
- Infra: Docker Compose for app + MongoDB + Redis Stack
- Testing: Jest + `ts-jest` + `supertest`
- Test database: `mongodb-memory-server`
- Tooling: ESLint, TypeDoc, `tsx`, `ts-node`

Notes about infra:

- MongoDB is the primary datastore used by the app today.
- Redis is configured in Docker and has a connection helper, but it is not heavily integrated into the current request flow.
- README mentions semantic search, but there is no substantial semantic search implementation wired into the current source tree yet.

## File Structure

- `app/src/index.ts`: app bootstrap, env validation, Mongo connection, server startup, graceful shutdown
- `app/src/app.ts`: Express app assembly, `/status`, `/api`, static `/uploads` and `/docs`, global error handler
- `app/src/routes/*`: route definitions by domain
- `app/src/requests/*`: HTTP handlers, usually thin wrappers around services
- `app/src/services/*`: business logic and DB interaction
- `app/src/models/*`: Mongoose schemas, hooks, methods, statics, validators, plugins
- `app/src/middlewares/*`: auth, pagination, filtering, sorting, schema validation, error handling
- `app/src/schemas/http/*`: Zod schemas for request payloads and query parsing
- `app/src/helpers/*`: config, JWT, request response helpers, query builder, media utilities
- `app/src/config/*`: Mongo, Redis, logger, multer config
- `app/src/types/*`: shared types plus Express request augmentation
- `app/src/seeders/*`: database seeders used both locally and in tests
- `app/tests/*`: unit and integration tests
- `app/logs/*`: rotating debug/system/error logs
- `docs/*`: project docs and pipeline notes

## Scripts

Top-level `Makefile`:

- `make up`: start Docker services
- `make build`: build and start Docker services
- `make down`: stop Docker services
- `make rebuild_app`: rebuild only the app container
- `make seed-<name>`: run a specific seeder in the app container
- `make o_app`, `make o_mongo`, `make o_redis`: open a shell in a container
- `make log_app`, `make log_mongo`, `make log_redis`: inspect container logs

Inside `app/package.json`:

- `npm run dev`: run the app with `tsx` watch mode
- `npm run build`: compile TypeScript
- `npm run start`: run via `ts-node`
- `npm run test`: run Jest
- `npm run lint`: lint `src`
- `npm run fix`: auto-fix lint issues in `src`
- `npm run seed`: run the seeder runner
- `npm run docs`: generate TypeDoc output

## Code Best Practices

- Keep the existing layering.
  Route -> middleware -> request handler -> service -> model/helper is the dominant pattern in this repo.

- Keep request handlers thin.
  Handlers should parse input, call a service, and send a formatted response. Push business logic into `services`.

- Use the shared response helpers.
  Prefer `setSuccessResponse` and the central error flow instead of ad hoc JSON shapes.

- Use `asyncHandler` for async request handlers.
  This repo expects async errors to bubble into the global `errorHandler`.

- Prefer throwing domain errors for expected failures.
  Use `HttpError`, `NotFoundError`, and `BadInputError` for application-level failures so the error middleware formats them consistently.

- Validate inputs with Zod.
  HTTP payloads are defined under `app/src/schemas/http`. Many handlers also call `schema.parse(...)` directly even when route middleware already validated the body. Preserve that pattern unless you are intentionally refactoring it consistently.

- Use middleware-derived request state instead of reparsing query concerns in handlers.
  Pagination, filtering, and sorting populate `req.offset`, `req.limit`, `req.dbFilter`, and `req.sort`, which are then assembled by `buildRequestData`.

- Keep imports on path aliases.
  The project uses `@/*` for source and `@tests/*` for tests via `tsconfig.json`.

- Follow the Mongoose model conventions already in place.
  Models often include statics, hooks, validators, and the custom `paginate` query helper plugin.

- Write tests for behavior, not just implementation.
  There are unit tests for helpers/services and request-level tests using `supertest`. For route bugs, prefer adding an HTTP-level regression test.

- Preserve route ordering carefully.
  Static routes must appear before dynamic params. Example: `/geosearch` must be declared before `/:eventId`.

- Be careful with geospatial data.
  Query params are expressed as `lat` and `lng`, but stored Mongo GeoJSON coordinates must be `[lng, lat]`. This area has already caused real bugs, so double-check both query building and persisted event coordinates when editing geosearch-related code.

- Radius for geosearch is in kilometers at the API boundary.
  The API accepts `radius` in kilometers and converts it to meters before passing it to MongoDB.

- Event dates are sent as Unix seconds.
  The event schema accepts numeric timestamps in seconds, and the Mongoose model converts them to `Date`.

- Seed data matters in tests.
  The Jest setup seeds categories, interests, users, event types, and events into an in-memory Mongo instance before tests run.

## Notes

- After completing a change, run lint/tests for the affected area at minimum.
- If you change seeders, restart or reseed the environment that owns your Mongo data. Editing a seeder file does not update existing documents automatically.
- Logs are written under `app/logs/` as daily rotating `debug`, `system`, and `error` files. If a user reports “today’s error log,” start there.
- Categories are currently public.
- Event router currently contains some duplicated route registration patterns. Read the file before editing and avoid assuming it has already been normalized.
- The event HTTP schema still has some coordinate-order naming inconsistency in `location.coordinates` validation. When touching event location validation, verify behavior against Mongo GeoJSON expectations rather than trusting variable names alone.
