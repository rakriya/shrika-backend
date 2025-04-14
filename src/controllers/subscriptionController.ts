import { createRazorpaySubscriptionAndSave } from "./../services/subscriptionService";
import { Request, NextFunction, Response } from "express";
import prisma from "../config/prisma";
import { SUBSCRIPTION_STATUS } from "../constants";
import createHttpError from "http-errors";
import logger from "../config/logger";

export const renewSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const { subscriptionId } = req.params;

  const oldSub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { society: true },
  });

  if (
    !oldSub ||
    (oldSub.status !== SUBSCRIPTION_STATUS.COMPLETED &&
      oldSub.status !== SUBSCRIPTION_STATUS.CANCELLED)
  ) {
    return next(createHttpError(400, "Invalid or already haas active subscription"));
  }

  const { razorpaySubscription } = await createRazorpaySubscriptionAndSave({
    phoneNumber: oldSub.phoneNumber,
    email: oldSub.email,
    societyId: oldSub.societyId,
    notes: { renewed_from: oldSub.razorpaySubId },
  });

  logger.info(
    `Razorpay subscription renewed for ${oldSub.society.name} with id ${razorpaySubscription.id}`,
    {
      razorpaySubId: razorpaySubscription.id,
      oldSubId: oldSub.razorpaySubId,
      societyId: oldSub.societyId,
    },
  );

  res.json({ redirectTo: razorpaySubscription.short_url });
};
