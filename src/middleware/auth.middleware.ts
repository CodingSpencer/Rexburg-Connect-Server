import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

// 1. Define a targeted wrapper type
export interface AuthenticatedRequest extends Request {
    user?: typeof auth.$Infer.Session.user;
}

export const authenticateToken = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).json({ error: "Unauthorized: Invalid or missing session." });
        }

        // 2. Cast standard request to your custom interface during assignment
        (req as AuthenticatedRequest).user = session.user; 
        next();
    } catch (error) {
        next(error);
    }
};