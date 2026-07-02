import { Router } from "express";
import { AuthService } from "../services/auth.service.js";

const router = Router();

router.post('/login', async (req, res, next) => {
    try {
        const authData = await AuthService.login(req.body);
        res.status(200).json(authData);
    } catch (error) {
        next(error);
    }
});

export default router;