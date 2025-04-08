import { OTP_BODY, OTP_EXPIREY_IN_MINUTES, OTP_STATUS } from "../constants";
import { generateOtp } from "../utils/generateOtp";
import redis from "../config/redis";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import logger from "../config/logger";
import { sendMessage } from "../utils/sendMessage";

export const createOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { purpose, phoneNumber, memberId, societyId } = req.body;

    const member = await prisma.member.findFirst({
      where: { OR: [{ phoneNumber, id: memberId }], societyId },
    });
    if (!member) {
      return next(
        createHttpError(
          400,
          `No member found with the provided ${phoneNumber ? "Phone number: " + phoneNumber : "ID: " + memberId}. `,
        ),
      );
    }

    const otp = generateOtp();

    await sendMessage({
      body: OTP_BODY.replace("$otp", otp).replace("$duration", String(OTP_EXPIREY_IN_MINUTES)),
      to: `+91${member.phoneNumber}`,
    });

    const key = `otp:${purpose}:${phoneNumber || memberId}:${societyId}`;
    const value = JSON.stringify({
      otp,
      purpose,
      status: OTP_STATUS.UNUSED,
    });
    await redis.set(key, value, "EX", OTP_EXPIREY_IN_MINUTES * 60);

    logger.info(`Otp is sent on Phone number +91${member.phoneNumber}`);

    res.status(201).json({
      message: `Otp is sent on Phone number +91${member.phoneNumber}`,
    });
  } catch (error) {
    next(error);
  }
};
