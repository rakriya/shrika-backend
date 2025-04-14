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

    res.status(200).json({ received: true });

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
      // TODO: Implement other Razorpay webhook events as needed. like `subscription.pending`, `subscription.halted`, etc.
      default:
        logger.warn(`Unhandled Razorpay event type: ${event}`);
        break;
    }

    logger.info(`Razorpay webhook event: ${event} | Event ID: ${eventId} processed successfully`);
  } catch (error) {
    // TODO: Implement a queue-based retry mechanism for failed Razorpay webhook events.
    // Store the `eventId` and full request body (including headers if needed) in a persistent store like Redis or a database. ---> FIFO
    // We may create a separate worker or background job processor to handle Razorpay webhook events independently with retry mechanism.
    return next(error);
  }
};
