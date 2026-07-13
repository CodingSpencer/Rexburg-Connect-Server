# Authentication & Authorization Overview

This backend uses `better-auth` to handle authentication endpoints and session validation.

## Authentication vs Authorization

- **Authentication**: Validates a user session using `better-auth`.
- **Authorization**: Requires a valid authenticated session before allowing access to protected routes.

## better-auth flow

1. `src/lib/auth.ts` configures `betterAuth` with:
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `emailAndPassword.enabled: true`
2. `src/server.ts` mounts auth endpoints at `api/auth/*` using `toNodeHandler(auth)`.
3. Client applications log in via `better-auth` routes, which manage sessions and credential verification.

## Protected Routes

- `src/routes/reviews.routes.ts` applies `authenticateToken` middleware to all routes in that router.
- Requests to protected routes must include session headers that `better-auth` can validate.

## Middleware: `authenticateToken`

Located at `src/middleware/auth.middleware.ts`.

- Calls `auth.api.getSession(...)` with the request headers.
- Uses `fromNodeHeaders(req.headers)` to translate Express headers into the format expected by `better-auth`.
- If the session is valid, assigns `session.user` to `req.user`.
- If no session is found, returns a `401 Unauthorized` response.
- If auth validation fails unexpectedly, the error is forwarded to the global error handler.

## User context

- `req.user` is populated with the authenticated session user.
- Protected route handlers can read `req.user` to determine the current user.

## Notes

- Current auth routing is handled by `better-auth` under `api/auth/*`.
- Legacy JWT-based login code exists in the repository, but the active authentication flow uses `better-auth`.
- There is currently no role-based authorization or permissions middleware in place.
- The `src/middleware/authorize.mts` file remains empty and is not part of the current auth flow.
