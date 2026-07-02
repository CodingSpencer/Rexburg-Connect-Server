import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { UnauthorizedError } from '../errors/UnauthorizedError.mjs';
import { User } from '../models/User.js';

// Clean up all stubs automatically after each test runs
test.afterEach(() => {
  mock.reset();
});

test('AuthService.login returns token and user for valid credentials', async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES = '1h';

  // Safely mock the Mongoose query chain using Node's native mocking engine
  mock.method(User, 'findOne', () => ({
    select: () => ({
      exec: async () => ({
        _id: 'abc123',
        email: 'test@example.com',
        name: 'Test User',
        comparePassword: async (password: string) => password === 'password',
      })
    })
  }));

  const result = await AuthService.login({ email: 'test@example.com', password: 'password' });

  assert.ok(result.token, 'Expected a JWT token');
  assert.strictEqual(result.user.email, 'test@example.com');
  assert.strictEqual(result.user.name, 'Test User');
});

test('AuthService.login throws UnauthorizedError when user is not found', async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES = '1h';

  // Mock the query chain to resolve to null
  mock.method(User, 'findOne', () => ({
    select: () => ({
      exec: async () => null
    })
  }));

  await assert.rejects(
    () => AuthService.login({ email: 'missing@example.com', password: 'password' }),
    UnauthorizedError
  );
});

test('authenticateToken attaches decoded user payload and calls next for a valid token', () => {
  process.env.JWT_SECRET = 'test-secret';
  const token = jwt.sign({ userId: 'abc123', email: 'test@example.com' }, process.env.JWT_SECRET);

  const req = { headers: { authorization: `Bearer ${token}` } } as any;
  let nextCalls = 0;

  authenticateToken(req, {} as any, () => {
    nextCalls += 1;
  });

  assert.strictEqual(nextCalls, 1);
  assert.strictEqual(req.user?.userId, 'abc123');
  assert.strictEqual(req.user?.email, 'test@example.com');
  assert.ok(typeof req.user?.iat === 'number');
});

test('authenticateToken throws UnauthorizedError when Authorization header is missing', () => {
  const req = { headers: {} } as any;

  assert.throws(() => authenticateToken(req, {} as any, () => undefined), UnauthorizedError);
});