import express from "express";
import { renewSubscription } from "../controllers/subscriptionController";

const router = express.Router();

router.post("/renew/:subscriptionId", renewSubscription);

export default router;
