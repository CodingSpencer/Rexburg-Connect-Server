import { betterAuth } from 'better-auth';

export const auth = betterAuth({
    baseURL: process.env.PUBLIC_AUTH_API_URL || "http://localhost:3001/api/auth",
    secret: process.env.BETTER_AUTH_SECRET,
    url: process.env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:4321"],
    emailAndPassword: {
        enabled: true,
    },
});