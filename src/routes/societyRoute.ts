import express from "express";
import { createSociety } from "../controllers/societyController";
import { societyCreateSchema } from "../joiSchemas/societySchema";
import { validate } from "../middlewares/validate";

const router = express.Router();

router.post("/", validate(societyCreateSchema), createSociety);

export default router;
