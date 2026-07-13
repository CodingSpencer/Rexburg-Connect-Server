import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from '../src/lib/env.js';

test('loadEnv reads values from the repository .env file', async () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const envPath = path.join(repoRoot, '.env');
  const previousValue = process.env.TEST_ENV_LOAD_FLAG;

  await writeFile(envPath, 'TEST_ENV_LOAD_FLAG=from-env-file\n', 'utf8');

  try {
    delete process.env.TEST_ENV_LOAD_FLAG;
    loadEnv();
    assert.strictEqual(process.env.TEST_ENV_LOAD_FLAG, 'from-env-file');
  } finally {
    delete process.env.TEST_ENV_LOAD_FLAG;
    await rm(envPath, { force: true });

    if (previousValue === undefined) {
      delete process.env.TEST_ENV_LOAD_FLAG;
    } else {
      process.env.TEST_ENV_LOAD_FLAG = previousValue;
    }
  }
});
