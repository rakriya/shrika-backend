import { roleCreationSchema } from "./../joiSchemas/roleSchema";
import express, { RequestHandler } from "express";
import { getAllSocieties, getSocietyById, setupSociety } from "../controllers/societyController";
import { societySetupSchema } from "../joiSchemas/societySchema";
import { validate } from "../middlewares/validate";
import { commonUploader, validateAllFiles } from "../middlewares/multer";
import { createMember } from "../controllers/memberController";
import { memberCreateSchema } from "../joiSchemas/memberSchema";
import { createRole } from "../controllers/roleController";
import hasPermission from "../middlewares/hasPermission";
import { checkSocietyMatch } from "../middlewares/checkSocietyMatch";
import authenticate from "../middlewares/authenticate";
import { requireDevTeamAccess } from "../middlewares/check";

const router = express.Router();

router.post(
  "/",
  validate(societySetupSchema),
  commonUploader("single", "logo", 1),
  validateAllFiles as unknown as RequestHandler,
  setupSociety,
);
router.get("/", requireDevTeamAccess, getAllSocieties);
router.get("/:id", getSocietyById);

router.post(
  "/:societyId/members",
  authenticate as RequestHandler,
  checkSocietyMatch as RequestHandler,
  hasPermission("create_member") as RequestHandler,
  validate(memberCreateSchema),
  createMember as RequestHandler,
);
router.post("/:societyId/roles", validate(roleCreationSchema), createRole);

export default router;
