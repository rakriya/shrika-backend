import express, { RequestHandler } from "express";
import { razorpayWebhook } from "../controllers/webhookController";
import { razorpayIdempotency, razorpayVerifySinature } from "../middlewares/razorpay";

const router = express.Router();

router.post(
  "/razorpay",
  razorpayIdempotency as RequestHandler,
  razorpayVerifySinature as RequestHandler,
  razorpayWebhook as RequestHandler,
);

export default router;
