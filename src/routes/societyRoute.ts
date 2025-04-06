import { roleCreationSchema } from "./../joiSchemas/roleSchema";
import express, { RequestHandler } from "express";
import { createSociety, getAllSocieties, getSocietyById } from "../controllers/societyController";
import { societyCreateSchema } from "../joiSchemas/societySchema";
import { validate } from "../middlewares/validate";
import { commonUploader, validateAllFiles } from "../middlewares/multer";
import { createMember } from "../controllers/memberController";
import { memberCreateSchema } from "../joiSchemas/memberSchema";
import { createRole } from "../controllers/roleController";

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

router.post("/:societyId/members", validate(memberCreateSchema), createMember);
router.post("/:societyId/roles", validate(roleCreationSchema), createRole);

export default router;
