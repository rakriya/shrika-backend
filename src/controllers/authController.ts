import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import createHttpError from "http-errors";
import { getBcrypt } from "../config/bcrypt";
import { findOtp, updateOtpStatus } from "../services/otpService";
import {
  COOKIE_ACCESS_TOKEN_NAME,
  COOKIE_REFRESH_TOKEN_NAME,
  OTP_PURPOSE,
  OTP_STATUS,
} from "../constants";
import logger from "../config/logger";
import { JwtPayload } from "jsonwebtoken";
import {
  deleteRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
} from "../services/tokenService";
import env from "../config/dotenv";
import { generateNormalizeIp } from "../utils/getNormalizeIp";
import { IRefreshTokenParse } from "../types";

export const loginMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, password, societyId, otp } = req.body;

    const member = await prisma.member.findFirst({
      where: { phoneNumber, societyId },
      omit: { password: false },
      include: { role: true },
    });
    if (!member) {
      return next(createHttpError(400, `Wrong Credentials.`));
    }

    const bcrypt = await getBcrypt();
    const isPasswordMatched = await bcrypt.compare(password, member.password);
    if (!isPasswordMatched) {
      return next(createHttpError(400, `Wrong Credentials.`));
    }

    const foundOtp = await findOtp({
      phoneNumber,
      purpose: OTP_PURPOSE.LOGIN,
      societyId,
    });

    if (foundOtp.status === OTP_STATUS.USED) {
      return next(createHttpError(400, `Otp is already used.`));
    }

    if (foundOtp.purpose !== OTP_PURPOSE.LOGIN) {
      return next(createHttpError(400, `Wrong otp.`));
    }

    if (foundOtp.otp !== otp) {
      return next(createHttpError(400, `Wrong otp.`));
    }

    await updateOtpStatus({ phoneNumber, purpose: OTP_PURPOSE.LOGIN, societyId });

    const payload: JwtPayload = {
      sub: member.id,
    };

    const accessToken = generateAccessToken({ payload });

    const userAgent = req.headers["user-agent"] || "unknown";
    const ipAddress = generateNormalizeIp(req);
    const isProd = env.NODE_ENV === "production";

    if (
      isProd &&
      (ipAddress.startsWith("192.168.") ||
        ipAddress.startsWith("10.") ||
        ipAddress.startsWith("172."))
    ) {
      return next(createHttpError(400, `Possible internal IP detected`));
    }

    const newRefreshToken = await saveRefreshToken({ userAgent, ipAddress, memberId: member.id });
    const refreshToken = generateRefreshToken({ payload: { ...payload, id: newRefreshToken.id } });

    res.cookie(COOKIE_ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: true,
      domain: isProd ? env.COOKIE_DOMAIN : undefined,
      sameSite: "strict",
      secure: isProd,
      maxAge: env.ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000,
    });

    res.cookie(COOKIE_REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: isProd ? env.COOKIE_DOMAIN : undefined,
      sameSite: "strict",
      secure: isProd,
      maxAge: env.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    logger.info(`User with Id: ${member.id} Logged In Successfully`);
    res.json({ message: "User Logged In Successfully" });
  } catch (error) {
    next(error);
  }
};

export const newAccessToken = async (
  req: IRefreshTokenParse,
  res: Response,
  next: NextFunction,
) => {
  try {
    const memberId = req.refreshTokenEntity.memberId;
    const id = req.refreshTokenEntity.id;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      return next(createHttpError(404, `Member not found for ID: ${memberId}`));
    }

    const payload: JwtPayload = {
      sub: member.id,
    };

    const accessToken = generateAccessToken({ payload });

    const userAgent = req.headers["user-agent"] || "unknown";
    const ipAddress = generateNormalizeIp(req);
    const isProd = env.NODE_ENV === "production";

    if (
      isProd &&
      (ipAddress.startsWith("192.168.") ||
        ipAddress.startsWith("10.") ||
        ipAddress.startsWith("172."))
    ) {
      return next(createHttpError(400, `Possible internal IP detected`));
    }
    // Delete old refresh token
    await deleteRefreshToken(id);

    const newRefreshToken = await saveRefreshToken({ userAgent, ipAddress, memberId: member.id });
    const refreshToken = generateRefreshToken({ payload: { ...payload, id: newRefreshToken.id } });

    res.cookie(COOKIE_ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: true,
      domain: isProd ? env.COOKIE_DOMAIN : undefined,
      sameSite: "strict",
      secure: isProd,
      maxAge: env.ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000,
    });

    res.cookie(COOKIE_REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: isProd ? env.COOKIE_DOMAIN : undefined,
      sameSite: "strict",
      secure: isProd,
      maxAge: env.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    logger.info("New access token has been created", {
      id: member.id,
    });
    res.json({ message: "New access token has been created", id: member.id });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: IRefreshTokenParse, res: Response, next: NextFunction) => {
  try {
    const memberId = req.refreshTokenEntity.memberId;
    const id = req.refreshTokenEntity.id;

    await deleteRefreshToken(id);

    res.clearCookie(COOKIE_REFRESH_TOKEN_NAME);
    res.clearCookie(COOKIE_ACCESS_TOKEN_NAME);

    logger.info("Refresh token has been deleted", {
      id,
    });

    logger.info("Member has been logged out", {
      id: memberId,
    });

    res.json({});
  } catch (error) {
    next(error);
  }
};
