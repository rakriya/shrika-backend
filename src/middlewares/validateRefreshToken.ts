import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { generateNormalizeIp } from "../utils/getNormalizeIp";
import { IRefreshTokenParse } from "../types";

export const validateRefreshToken = async (
  req: IRefreshTokenParse,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tokenEntity = req.refreshTokenEntity;

    if (!tokenEntity) {
      return next(createHttpError(401, "Missing token entity"));
    }

    const reqUserAgent = req.headers["user-agent"] || "unknown";
    if (reqUserAgent !== tokenEntity.userAgent)
      return next(createHttpError(401, "Device mismatch"));

    const reqIpAddress = generateNormalizeIp(req);
    if (reqIpAddress !== tokenEntity.ipAddress)
      return next(createHttpError(401, "IP address mismatch"));

    if (tokenEntity.expiresAt < new Date())
      return next(createHttpError(401, "Refresh token expired"));

    next();
  } catch (error) {
    next(error);
  }
};
