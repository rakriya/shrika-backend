import {
  GRACE_PERIOD_DAYS,
  SOCIETY_STATUS,
  SUBSCRIPTION_PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
  SubscriptionStatus,
} from "./../constants/index";
import { addDays, getUnixTime } from "date-fns";
import env from "../config/dotenv";
import prisma from "../config/prisma";
import razorpayInstance from "../config/razorpay";
import { SUBSCRIPTION_DURATION_MONTHS, TRIAL_LIMIT, MANDATE_EXPIRY_DAYS } from "../constants";
import createHttpError from "http-errors";
import logger from "../config/logger";

// Function to create a new subscription on Razorpay and store it in the database
type CreateSubscriptionParams = {
  phoneNumber: string;
  email: string;
  societyId: string;
  trial?: boolean;
  notes?: Record<string, any>;
};

export const createRazorpaySubscriptionAndSave = async ({
  phoneNumber,
  email,
  societyId,
  trial = false,
  notes = {},
}: CreateSubscriptionParams) => {
  const start_at = trial ? getUnixTime(addDays(new Date(), TRIAL_LIMIT)) : getUnixTime(new Date());

  const razorpaySub = await razorpayInstance.subscriptions.create({
    plan_id: env.RAZORPAY_PLAN_ID,
    total_count: SUBSCRIPTION_DURATION_MONTHS,
    start_at,
    expire_by: getUnixTime(addDays(new Date(), MANDATE_EXPIRY_DAYS)),
    notify_info: {
      notify_phone: phoneNumber,
      notify_email: email,
    },
    notes: {
      society_id: societyId,
      ...notes,
    },
  });

  const newSubscription = await prisma.subscription.create({
    data: {
      societyId,
      phoneNumber,
      email,
      razorpaySubId: razorpaySub.id,
      status: SUBSCRIPTION_STATUS.CREATED,
      planId: env.RAZORPAY_PLAN_ID,
      startDate: new Date(razorpaySub.start_at * 1000),
      endDate: new Date(razorpaySub.end_at * 1000),
      nextBillingAt: new Date(razorpaySub.charge_at * 1000),
      paidCount: razorpaySub.paid_count,
      authAttempts: razorpaySub.auth_attempts,
      customerId: razorpaySub.customer_id,
      shortUrl: razorpaySub.short_url,
    },
  });

  return { razorpaySubscription: razorpaySub, newSubscription };
};

// Function to handle subscription authentication event
export const handleSubscriptionAuthenticated = async (payload: {
  subscription: { entity: any };
}) => {
  const {
    subscription: { entity: razorpaySub },
  } = payload;
  const razorpaySubId = razorpaySub.id;
  const societyIdFromNotes = razorpaySub.notes?.society_id;

  try {
    if (!societyIdFromNotes) {
      throw createHttpError(400, "Missing society_id in Razorpay notes", {
        event: "subscription.authenticated",
        razorpaySubId,
      });
    }

    // Fetch subscription from database using Razorpay subscription ID
    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubId },
    });

    // Check if subscription exists and belongs to the correct society
    if (!subscription || subscription.societyId !== societyIdFromNotes) {
      throw createHttpError(404, "Subscription not found or mismatched society", {
        event: "subscription.authenticated",
        razorpaySubId,
      });
    }

    // Start a transaction to update subscription and society status
    await prisma.$transaction(async (tx) => {
      // Update the subscription status to authenticated
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: SUBSCRIPTION_STATUS.AUTHENTICATED },
      });

      // Check if the subscription is a trial or not and update society status accordingly
      const currentTimeSec = Math.floor(Date.now() / 1000);
      const isTrial = razorpaySub.start_at > currentTimeSec;

      if (isTrial) {
        // Update society status to "TRIAL" if the subscription is a trial
        await tx.society.update({
          where: { id: subscription.societyId },
          data: {
            status: SOCIETY_STATUS.TRIAL,
            isTrialUsed: true,
            trialEndDate: new Date(razorpaySub.start_at * 1000), // Set trial end date
          },
        });
      }
    });

    logger.info("Subscription authenticated successfully", {
      event: "subscription.authenticated",
      subscriptionId: subscription.id,
    });
    // TODO: send email to user for TRIAL and subscription confirmation
  } catch (error) {
    throw createHttpError(500, "Error handling subscription authenticated event", {
      event: "subscription.authenticated",
      razorpaySubId,
      error,
    });
  }
};

// Function to handle the subscription charged event (payment successful)
export const handleSubscriptionCharged = async (payload: { subscription: any; payment: any }) => {
  try {
    const { subscription: subscriptionDetails, payment: paymentDetails } = payload;
    const razorpaySubId = subscriptionDetails.entity.id;
    const razorpayPaymentId = paymentDetails.entity.id;

    // Fetch the subscription from the database using Razorpay subscription ID
    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubId },
    });

    const societyIdFromNotes = subscriptionDetails.entity.notes?.society_id;
    // Ensure the subscription exists and belongs to the correct society
    if (!subscription || !societyIdFromNotes || subscription.societyId !== societyIdFromNotes) {
      throw createHttpError(404, "Subscription not found or mismatched society", {
        event: "subscription.charged",
        razorpaySubId,
      });
    }

    // Start a transaction to update subscription, society, and store payment info
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SUBSCRIPTION_STATUS.ACTIVE,
          previousBillingAt: new Date(subscriptionDetails.entity.current_start * 1000),
          nextBillingAt: new Date(subscriptionDetails.charge_at * 1000),
          paidCount: subscriptionDetails.paid_count,
          authAttempts: subscriptionDetails.auth_attempts,
        },
      }),

      prisma.society.update({
        where: { id: subscription.societyId },
        data: { status: SOCIETY_STATUS.ACTIVE },
      }),

      prisma.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          paymentDate: new Date(paymentDetails.entity.created_at * 1000),
          amount: paymentDetails.entity.amount / 100,
          status: SUBSCRIPTION_PAYMENT_STATUS.SUCCESS,
          paymentBillingCycleCount: subscriptionDetails.paid_count,
          paymentMethod: paymentDetails.entity.payment_method,
          razorpayPaymentId,
        },
      }),
    ]);

    logger.info("Subscription payment recorded", {
      event: "subscription.charged",
      subscriptionId: subscription.id,
      razorpayPaymentId,
    });
    // TODO: send email to user with subscription details and payment confirmation
  } catch (error) {
    throw createHttpError(500, "Error handling subscription charged event", {
      event: "subscription.charged",
      subscriptionId: payload.subscription.entity.id,
      razorpayPaymentId: payload.payment.entity.id,
      error,
    });
  }
};

// Common function to handle both subscription completed and cancelled events
const handleSubscriptionCompletedAndCancelled = async (
  payload: { subscription: { entity: any } },
  status: SubscriptionStatus, // Passed as 'CANCELLED' or 'COMPLETED'
) => {
  const razorpaySub = payload.subscription.entity;
  const razorpaySubId = razorpaySub.id;

  const subscription = await prisma.subscription.findUnique({
    where: { razorpaySubId },
  });

  if (!subscription) {
    throw createHttpError(404, "Subscription not found", { razorpaySubId });
  }

  // Check for previous successful payment
  const previousPaid = await prisma.subscriptionPayment.findFirst({
    where: {
      subscriptionId: subscription.id,
      status: SUBSCRIPTION_PAYMENT_STATUS.SUCCESS,
    },
  });

  // Determine the grace period end date if previous payment exists
  const graceUntil = previousPaid ? addDays(new Date(), GRACE_PERIOD_DAYS) : null;

  try {
    await prisma.$transaction([
      // Update the society status based on payment history
      prisma.society.update({
        where: { id: subscription.societyId },
        data: {
          status: previousPaid ? SOCIETY_STATUS.GRACE : SOCIETY_STATUS.INACTIVE,
          graceUntil,
        },
      }),

      // Update the subscription status to the passed value ('CANCELLED' or 'COMPLETED')
      prisma.subscription.update({
        where: { id: subscription.id },
        data: { status },
      }),
    ]);
  } catch (error) {
    throw createHttpError(
      500,
      "Error while updating grance period and status of society and subscription",
      {
        event: `subscription.${status.toLowerCase()}`,
        razorpaySubId,
        error,
      },
    );
  }

  logger.info(`Subscription ${status.toLowerCase()}d, grace handled`, {
    razorpaySubId,
    graceGiven: !!previousPaid,
  });

  // TODO: Send email to user for renewal/expiry notification with renewal link
};

// Handler for subscription cancelled event
export const handleSubscriptionCancelled = async (payload: { subscription: { entity: any } }) => {
  await handleSubscriptionCompletedAndCancelled(payload, SUBSCRIPTION_STATUS.CANCELLED);
};

// Handler for subscription completed event
export const handleSubscriptionCompleted = async (payload: { subscription: { entity: any } }) => {
  await handleSubscriptionCompletedAndCancelled(payload, SUBSCRIPTION_STATUS.COMPLETED);
};
