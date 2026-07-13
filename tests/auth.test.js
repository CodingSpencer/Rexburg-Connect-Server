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
    }));
    const req = { headers: { authorization: 'Bearer token' } };
    let nextCalls = 0;
    await authenticateToken(req, {}, () => {
        nextCalls += 1;
    });
    assert.strictEqual(nextCalls, 1);
    assert.deepStrictEqual(req.user, mockedUser);
});
test('authenticateToken returns 401 when session is missing', async () => {
    mock.method(auth.api, 'getSession', async () => null);
    const req = { headers: { authorization: 'Bearer token' } };
    let statusCode = 0;
    let jsonBody = null;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(body) {
            jsonBody = body;
            return this;
        },
    };
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
    const req = { headers: { authorization: 'Bearer token' } };
    let nextError;
    await authenticateToken(req, {}, (err) => {
        nextError = err;
    });
    assert.strictEqual(nextError, authError);
});
//# sourceMappingURL=auth.test.js.map