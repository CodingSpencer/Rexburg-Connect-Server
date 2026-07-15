import { betterAuth } from 'better-auth';
import type { Db } from 'mongodb';
import { mongodbAdapter } from '@better-auth/mongo-adapter';

type AuthInstance = ReturnType<typeof betterAuth>;

let _auth: AuthInstance | null = null;

export function initAuth(db: Db) {
    const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3001";
    const isProduction = baseURL.includes("onrender.com");

    _auth = betterAuth({
        database: mongodbAdapter(db),
        baseURL,
        secret: process.env.BETTER_AUTH_SECRET,
        trustedOrigins: [
            "http://localhost:4321",
            "https://rexburg-connect-client.netlify.app",
        ],
        emailAndPassword: {
            enabled: true,
        },
        advanced: {
            ipAddress: {
                ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
                trustedProxies: [], // empty means trust all proxies; set to specific IPs in production if needed
            },
            cookies: {
                sessionToken: {
                    sameSite: isProduction ? "none" : "lax",
                    secure: isProduction,
                },
            },
        },
    }) as unknown as AuthInstance;
    return _auth;
}

export function getAuth(): AuthInstance {
    if (!_auth) {
        throw new Error('Auth not initialized. Call initAuth(db) first after connecting to MongoDB.');
    }
    return _auth;
}

/**
 * Singleton auth instance.
 * It is set once by initAuth() after the MongoDB connection is established.
 * Import this from app.ts, middleware, etc.
 */
export const auth = new Proxy(
    {} as AuthInstance,
    {
        get(_, prop) {
            return getAuth()[prop as keyof AuthInstance];
        },
    }
);