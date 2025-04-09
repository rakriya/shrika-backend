import express from "express";
import { loginMember } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../joiSchemas/authSchema";

const router = express.Router();

router.post("/login", validate(loginSchema), loginMember);

export default router;
