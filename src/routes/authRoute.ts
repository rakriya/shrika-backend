import express, { RequestHandler } from "express";
import { loginMember, logout, newAccessToken } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../joiSchemas/authSchema";
import { parseRefreshToken } from "../middlewares/parseRefreshTokenCookie";
import { validateRefreshToken } from "../middlewares/validateRefreshToken";

const router = express.Router();

router.post("/login", validate(loginSchema), loginMember);
router.get(
  "/refresh-token",
  parseRefreshToken as RequestHandler,
  validateRefreshToken as RequestHandler,
  newAccessToken as RequestHandler,
);
router.get("/logout", parseRefreshToken as RequestHandler, logout as RequestHandler);

export default router;
