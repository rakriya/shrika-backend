import { Response, NextFunction } from "express";
import logger from "../config/logger";
import {
  handleSubscriptionAuthenticated,
  handleSubscriptionCharged,
  handleSubscriptionCompleted,
  handleSubscriptionCancelled,
} from "../services/subscriptionService";
import { IRazorpayRequest } from "../types";

const RazorpayEvents = {
  AUTHENTICATED: "subscription.authenticated",
  CHARGED: "subscription.charged",
  COMPLETED: "subscription.completed",
  CANCELLED: "subscription.cancelled",
} as const;

export const razorpayWebhook = async (req: IRazorpayRequest, res: Response, next: NextFunction) => {
  const eventId = req.razorpay.eventId;

  try {
    const event = req.body.event;
    const payload = req.body.payload;

    logger.info(`Received Razorpay webhook event: ${event} | Event ID: ${eventId}`);
    switch (event) {
      case RazorpayEvents.AUTHENTICATED:
        await handleSubscriptionAuthenticated(payload);
        break;
      case RazorpayEvents.CHARGED:
        await handleSubscriptionCharged(payload);
        break;
      case RazorpayEvents.COMPLETED:
        await handleSubscriptionCompleted(payload);
        break;
      case RazorpayEvents.CANCELLED:
        await handleSubscriptionCancelled(payload);
        break;
      default:
        logger.warn(`Unhandled Razorpay event type: ${event}`);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    return next(error);
  }
};
