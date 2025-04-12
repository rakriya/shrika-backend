import express, { RequestHandler } from "express";
import {
  forgotPassword,
  loginMember,
  logout,
  newAccessToken,
  resetPassword,
} from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "../joiSchemas/authSchema";
import { parseRefreshToken } from "../middlewares/parseRefreshTokenCookie";
import { validateRefreshToken } from "../middlewares/validateRefreshToken";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.post("/login", validate(loginSchema), loginMember);
router.get(
  "/refresh-token",
  parseRefreshToken as RequestHandler,
  validateRefreshToken as RequestHandler,
  newAccessToken as RequestHandler,
);
router.get("/logout", parseRefreshToken as RequestHandler, logout as RequestHandler);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authenticate as RequestHandler,
  forgotPassword as RequestHandler,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authenticate as RequestHandler,
  resetPassword as RequestHandler,
);

export default router;
