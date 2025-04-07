import express from "express";
import { loginMember, verifyLoginOtp } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { loginSchema, verifyLoginOtpSchema } from "../joiSchemas/authSchema";

const router = express.Router();

router.post("/login", validate(loginSchema), loginMember);
router.post("/verify-otp", validate(verifyLoginOtpSchema), verifyLoginOtp);

export default router;
