import express from "express";
import { createSociety } from "../controllers/societyController";

const router = express.Router();

router.post("/", createSociety);

export default router;
