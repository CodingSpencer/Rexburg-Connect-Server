import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all routes below this middleware line
router.use(authenticateToken);

router.post('/reviews', async (req: AuthenticatedRequest, res, next) => {
    try {
        // Highly secure context
        const creatorId = req.user?.userId;
        // Construct and save new review
        res.status(201).json({ message: 'Review created successfully!' });
    } catch (error) {
        next(error);
    }
});

export default router;