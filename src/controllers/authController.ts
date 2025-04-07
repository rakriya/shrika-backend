import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import createHttpError from "http-errors";
import { getBcrypt } from "../config/bcrypt";
import { createOtp, findOtp, updateOtpStatus } from "../services/otpService";
import { LOGIN_OTP_BODY, OTP_EXPIREY_IN_MINUTES, OTP_PURPOSE, OTP_STATUS } from "../constants";
import { sendMessage } from "../utils/sendMessage";

export const loginMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, password, societyId } = req.body;

    const member = await prisma.member.findFirst({
      where: { phoneNumber, societyId },
      omit: { password: false },
    });
    if (!member) {
      return next(createHttpError(400, `Wrong Credencials.`));
    }

    const bcrypt = await getBcrypt();
    const isPasswordMatched = await bcrypt.compare(password, member.password);
    if (!isPasswordMatched) {
      return next(createHttpError(400, `Wrong Credencials.`));
    }

    const otp = await createOtp({
      phoneNumber,
      purpose: OTP_PURPOSE.LOGIN,
    });

    await sendMessage({
      body: LOGIN_OTP_BODY.replace("$otp", otp).replace(
        "$duration",
        String(OTP_EXPIREY_IN_MINUTES),
      ),
      to: `+91${phoneNumber}`,
    });

    res.json({ message: "Otp is sent to your phone number sucessfully", otp });
  } catch (error) {
    next(error);
  }
};

export const verifyLoginOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, otp } = req.body;

    const foundOtp = await findOtp({ phoneNumber, purpose: OTP_PURPOSE.LOGIN });

    if (foundOtp.status === OTP_STATUS.USED) {
      return next(createHttpError(400, `Otp is already used.`));
    }

    if (foundOtp.purpose !== OTP_PURPOSE.LOGIN) {
      return next(createHttpError(400, `Wrong otp.`));
    }

    if (foundOtp.otp !== otp) {
      return next(createHttpError(400, `Wrong otp.`));
    }

    await updateOtpStatus({ phoneNumber, purpose: OTP_PURPOSE.LOGIN });

    // todo : create jwt token and save into cookie

    res.json({ message: "Member logged in successfully", otp });
  } catch (error) {
    next(error);
  }
};
