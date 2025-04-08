import express from "express";
import { validate } from "../middlewares/validate";
import { createOtp } from "../controllers/otpController";
import { sendOtpSchema } from "../joiSchemas/otpSchema";

const router = express.Router();

router.post("/send-otp", validate(sendOtpSchema), createOtp);

export default router;
