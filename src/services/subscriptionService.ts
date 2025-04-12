import { addDays, getUnixTime } from "date-fns";
import env from "../config/dotenv";
import prisma from "../config/prisma";
import razorpayInstance from "../config/razorpay";
import { SUBSCRIPTION_DURATION_MONTHS, TRAIL_LIMIT, MANDATE_EXPIRY_DAYS } from "../constants";

export const createSubscription = async (phoneNumber: string, societyId: string, email: string) => {
  const razorpaySubscription = await razorpayInstance.subscriptions.create({
    plan_id: env.RAZORPAY_PLAN_ID,
    total_count: SUBSCRIPTION_DURATION_MONTHS,
    start_at: getUnixTime(addDays(new Date(), TRAIL_LIMIT)),
    expire_by: getUnixTime(addDays(new Date(), MANDATE_EXPIRY_DAYS)),
    notify_info: {
      notify_phone: phoneNumber,
      notify_email: email,
    },
    notes: {
      society_id: societyId,
    },
  });

  const newSubscription = await prisma.subscription.create({
    data: {
      societyId,
      razorpaySubId: razorpaySubscription.id,
      status: "pending", // Or "active" based on initial payment
      planId: env.RAZORPAY_PLAN_ID,
      startDate: new Date(razorpaySubscription.start_at * 1000),
      endDate: new Date(razorpaySubscription.end_at * 1000),
      nextBillingAt: new Date(razorpaySubscription.charge_at * 1000),
      paidCount: razorpaySubscription.paid_count,
      authAttempts: razorpaySubscription.auth_attempts,
      customerId: razorpaySubscription.customer_id,
      paymentMethod: razorpaySubscription.payment_method,
      shortUrl: razorpaySubscription.short_url,
    },
  });
  return { razorpaySubscription, newSubscription };
};
