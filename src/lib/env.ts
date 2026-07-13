import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const envFileNames = ['.env', '.env.local'];

function findEnvFile(startDir: string): string | null {
    let currentDir = startDir;

    while (true) {
        for (const fileName of envFileNames) {
        const candidate = path.join(currentDir, fileName);
        if (existsSync(candidate)) {
            return candidate;
        }
        }

        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
        return null;
        }

        currentDir = parentDir;
    }
}

export function loadEnv(): void {
    const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
    const envFilePath = findEnvFile(currentFileDir);

    if (!envFilePath) {
        return;
    }

    const content = readFileSync(envFilePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
        continue;
        }

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) {
        continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();

        if (!key || process.env[key] !== undefined) {
        continue;
        }

        process.env[key] = value.replace(/^['"]|['"]$/g, '');
    }
}
