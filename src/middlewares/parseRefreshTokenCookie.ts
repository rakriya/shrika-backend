import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { COOKIE_REFRESH_TOKEN_NAME } from "../constants";
import createHttpError from "http-errors";
import env from "../config/dotenv";
import prisma from "../config/prisma";
import { IRefreshTokenParse } from "../types";

interface IDecodedRefreshToken {
  id: string;
}

export const parseRefreshToken = async (
  req: IRefreshTokenParse,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies[COOKIE_REFRESH_TOKEN_NAME] || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(createHttpError(401, "Refresh token is missing"));
    }

    const decordedRefreshToken = jwt.verify(token, env.REFRESH_JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    }) as IDecodedRefreshToken;

    const id = decordedRefreshToken.id;
    const tokenEntity = await prisma.refreshToken.findUnique({ where: { id } });

    if (!tokenEntity) return next(createHttpError(401, "Refresh token not found"));

    req.refreshTokenEntity = tokenEntity;

    next();
  } catch (error) {
    next(error);
  }
};
