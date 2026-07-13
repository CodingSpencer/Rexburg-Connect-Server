import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { auth } from '../src/lib/auth.js';
import { authenticateToken } from '../src/middleware/auth.middleware.js';

// Clean up all stubs automatically after each test runs
test.afterEach(() => {
  mock.reset();
});

test('authenticateToken attaches session user and calls next for a valid session', async () => {
  const mockedUser = { id: 'abc123', email: 'test@example.com', name: 'Test User' };

  mock.method(auth.api, 'getSession', async () => ({
    user: mockedUser,
  } as any));

  const req = { headers: { authorization: 'Bearer token' } } as any;
  let nextCalls = 0;

  await authenticateToken(req, {} as any, () => {
    nextCalls += 1;
  });

  assert.strictEqual(nextCalls, 1);
  assert.deepStrictEqual((req as any).user, mockedUser);
});

test('authenticateToken returns 401 when session is missing', async () => {
  mock.method(auth.api, 'getSession', async () => null);

  const req = { headers: { authorization: 'Bearer token' } } as any;
  let statusCode = 0;
  let jsonBody: unknown = null;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      jsonBody = body;
      return this;
    },
  } as any;

  await authenticateToken(req, res, () => undefined);

  assert.strictEqual(statusCode, 401);
  assert.deepStrictEqual(jsonBody, {
    error: 'Unauthorized: Invalid or missing session.',
  });
});

test('authenticateToken forwards auth errors to next', async () => {
  const authError = new Error('Auth service failure');
  mock.method(auth.api, 'getSession', async () => {
    throw authError;
  });

  const req = { headers: { authorization: 'Bearer token' } } as any;
  let nextError: unknown;

  await authenticateToken(req, {} as any, (err?: unknown) => {
    nextError = err;
  });

  assert.strictEqual(nextError, authError);
});
