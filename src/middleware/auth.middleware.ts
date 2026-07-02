import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/UnauthorizedError.mjs";

interface TokenPayload {
    userId: string;
    email: string;
}

// Extend Express Request locally in not globally
export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    // Expecting format: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        throw new UnauthorizedError('Authentication token missing.');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new UnauthorizedError('JWT secret missing.');
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            throw new UnauthorizedError('Invalid authentication token.');
        }

        req.user = decoded as TokenPayload;
        next();
    });
};