import express, { RequestHandler } from "express";
import { createSociety } from "../controllers/societyController";
import { societyCreateSchema } from "../joiSchemas/societySchema";
import { validate } from "../middlewares/validate";
import { commonUploader, validateAllFiles } from "../middlewares/multer";

const router = express.Router();

router.post(
  "/",
  validate(societyCreateSchema),
  commonUploader("fields", [
    { name: "logo", maxCount: 2 },
    { name: "photo", maxCount: 4 },
  ]),
  validateAllFiles as unknown as RequestHandler,
  createSociety,
);

export default router;
