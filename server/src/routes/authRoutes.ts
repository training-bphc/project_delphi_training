import { Router } from "express";
import { devLogin, googleAuth } from "../controllers/authController";

const router = Router();

router.post("/google", googleAuth);
router.post("/dev-login", devLogin);

export default router;
