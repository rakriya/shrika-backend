import { ALLOWED_PERMISSIONS, SALT_ROUNDS, SOCIETY_STATUS } from "./../constants/index";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger";
import createHttpError from "http-errors";
import { getBcrypt } from "../config/bcrypt";
import { createRazorpaySubscriptionAndSave as createSocietyTrialSubscription } from "../services/subscriptionService";
import { sendEmail } from "../utils/sendEmail";
import { societySetupComplete } from "../emailTemplate/societySetupComplete";
const prisma = new PrismaClient();

export const getAllSocieties = async (req: Request, res: Response) => {
  try {
    // Logic to fetch all societies from the database
    const societies = await prisma.society.findMany();
    res.status(200).json(societies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching societies", error });
  }
};

export const getSocietyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Logic to fetch a society by ID from the database
    const society = await prisma.society.findUnique({ where: { id } });
    if (!society) {
      return next(createHttpError(400, `No society found with the provided ID: ${id}.`));
    }
    res.status(200).json(society);
  } catch (error) {
    res.status(500).json({ message: "Error fetching society", error });
  }
};

export const setupSociety = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // todo: verfy phone number and email
    const { societyName, adminName, adminPhone, adminEmail, adminPassword } = req.body;

    if (!adminEmail) {
      return next(createHttpError(400, "Admin email is required."));
    }

    // Check for existing society
    const existingSociety = await prisma.society.findUnique({
      where: { name: societyName },
    });
    if (existingSociety) {
      return next(createHttpError(409, "Society name already taken."));
    }

    // Hash the admin password
    const bcrypt = await getBcrypt();
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const newSociety = await tx.society.create({
        data: { name: societyName, status: SOCIETY_STATUS.CREATED },
      });

      const adminRole = await tx.role.create({
        data: {
          name: "Super Admin",
          permissions: [...ALLOWED_PERMISSIONS],
          societyId: newSociety.id,
        },
      });

      const firstMember = await tx.member.create({
        data: {
          name: adminName,
          email: adminEmail,
          phoneNumber: adminPhone,
          password: hashedPassword,
          roleId: adminRole.id,
          societyId: newSociety.id,
        },
      });

      return { newSociety, firstMember };
    });

    let newSubscription, razorpaySubscription;
    try {
      // Create Razorpay subscription with trial
      const subscriptionResult = await createSocietyTrialSubscription({
        phoneNumber: result.firstMember.phoneNumber,
        email: result.firstMember.email!,
        societyId: result.newSociety.id,
        trial: true,
      });
      newSubscription = subscriptionResult.newSubscription;
      razorpaySubscription = subscriptionResult.razorpaySubscription;
    } catch (subscriptionError) {
      await prisma.society.update({
        where: { id: result.newSociety.id },
        data: { status: SOCIETY_STATUS.SUBSCRIPTION_FAILED },
      });
      return next(
        createHttpError(500, "Subscription setup failed. Please try again.", { subscriptionError }),
      );
    }

    const { html, subject } = societySetupComplete({
      userName: result.firstMember.name,
      razorpayLink: razorpaySubscription.short_url,
    });

    await sendEmail({
      to: result.firstMember.email!,
      subject,
      html,
    });

    logger.info(`✅ Society setup complete for: ${result.newSociety.name}`);

    res.status(201).json({
      message: "Society setup successful",
      society: {
        id: result.newSociety.id,
        name: result.newSociety.name,
        subscriptionId: newSubscription.id,
        razorpaySubscriptionId: razorpaySubscription.id,
        mandateApprovalLink: razorpaySubscription.short_url,
      },
      admin: {
        id: result.firstMember.id,
        name: result.firstMember.name,
        email: result.firstMember.email,
        phoneNumber: result.firstMember.phoneNumber,
      },
    });
  } catch (error) {
    return next(error);
  }
};
