# AGENTS.md

## Purpose
This repository is the backend for the Rexburg Connect application. AI coding agents should help maintain a clean, minimal, and consistent Express + TypeScript + MongoDB codebase.

## Project conventions
- Keep changes aligned with the existing folder structure under src/.
- Prefer small, focused edits over large rewrites.
- Use TypeScript and ES module syntax consistent with the current project setup.
- Preserve existing naming patterns for routes, services, models, and middleware.
- Do not hardcode secrets or environment-specific values. Use environment variables from .env.
- Keep error handling consistent with the custom error patterns already in the project.

## Architecture notes
- Entry points:
  - src/server.ts starts the API server.
  - src/app.ts is the application bootstrap location.
- Main areas:
  - src/routes/: API route definitions
  - src/services/: business logic
  - src/models/: Mongoose/TypeScript models and types
  - src/database/: database connection and initialization
  - src/middleware/: auth and error middleware
  - src/errors/: custom error classes

## Development workflow
- Run the API locally with: npm run dev
- Build the project with: npm run build
- Initialize or reset database data with: npm run init-db
- Prefer verifying changes with a build or relevant local check before finishing.

## Guidance for agents
- When adding features, wire them through routes, services, and models rather than placing logic inline.
- When changing database behavior, consider whether the change should also update initialization scripts or schemas.
- When editing auth-related code, keep security and validation behavior explicit and conservative.
- If a request is ambiguous, note the assumption rather than making an unsupported change.
