import express, { RequestHandler } from "express";
import { createSociety, getAllSocieties, getSocietyById } from "../controllers/societyController";
import { societyCreateSchema } from "../joiSchemas/societySchema";
import { validate } from "../middlewares/validate";
import { commonUploader, validateAllFiles } from "../middlewares/multer";
import { createMember } from "../controllers/memberController";

const router = express.Router();

router.post(
  "/",
  validate(societyCreateSchema),
  commonUploader("single", "logo", 1),
  validateAllFiles as unknown as RequestHandler,
  createSociety,
);
router.get("/", getAllSocieties);
router.get("/:id", getSocietyById);

// Nested: Create a member for a specific society
router.post("/:societyId/members", createMember);

export default router;
