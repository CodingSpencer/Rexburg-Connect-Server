import { Router } from "express";
import authRouter from "./auth.routes.js";
import reviewsRouter from "./reviews.routes.js";

const router = Router();

// Auth routes will begin with /api/auth
router.use("/auth", authRouter);

// Review routes already include their own paths
router.use(reviewsRouter);

export default router;