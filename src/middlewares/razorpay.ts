import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import logger from "../config/logger";
import redis from "../config/redis";
import env from "../config/dotenv";
import { IRazorpayRequest } from "../types";

export const razorpayIdempotency = async (
  req: IRazorpayRequest,
  res: Response,
  next: NextFunction,
) => {
  const eventId = req.headers["x-razorpay-event-id"];

  if (!eventId || typeof eventId !== "string") {
    return next(createHttpError(400, "Missing or invalid event ID"));
  }

  try {
    const setResult = await redis.set(`razorpay:${eventId}`, "processed", "EX", 60 * 60 * 24, "NX");

    if (!setResult) {
      logger.info(`Duplicate event received. Skipping: ${eventId}`);
      return res.status(200).json({ duplicate: true });
    }

    req.razorpay.eventId = eventId; // Store the event ID in the request object for later use

    next();
  } catch (error) {
    next(error);
  }
};

export const razorpayVerifySinature = async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers["x-razorpay-signature"];

  if (!signature || typeof signature !== "string") {
    return next(createHttpError(400, "Missing or invalid signature"));
  }

  try {
    const shasum = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return next(createHttpError(400, "Invalid signature"));
    }

    next();
  } catch (error) {
    next(error);
  }
};
