# Project Overview

## What this project is
Rexburg-Connect-Server is the backend service for the Rexburg Connect platform. It provides API endpoints for application data, user access, and database-backed business logic.

## Current stack
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JSON Web Tokens for authentication-related flows
- Swagger-based API documentation support

## Repository structure
- src/server.ts: starts the server and bootstraps the app.
- src/app.ts: application setup entry point.
- src/routes/: route definitions for API endpoints.
- src/services/: reusable service-layer logic.
- src/models/: data models and shared type definitions.
- src/database/: database connection, initialization, and schema helpers.
- src/middleware/: authorization and error handling middleware.
- src/errors/: custom error classes and error types.

## Typical development flow
1. Install dependencies with npm install.
2. Create or update a local .env file with the required environment variables.
3. Start the backend with npm run dev.
4. Add or update routes, services, and models as needed for new features.
5. Verify the project with npm run build.

## Notes for contributors
- Keep the API structure modular and easy to follow.
- Prefer reusable services over duplicate logic.
- Keep validation, authentication, and database operations explicit.
- Document notable changes in code comments or README updates when behavior changes.
