import { IAuthRequest } from "./../types/index";
import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import env from "../config/dotenv";
import { COOKIE_ACCESS_TOKEN_NAME } from "../constants";
import prisma from "../config/prisma";
import createHttpError from "http-errors";

const authenticate = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies[COOKIE_ACCESS_TOKEN_NAME] || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(createHttpError(401, "Access token is missing"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.PUBLIC_KEY, { algorithms: ["RS256"] });
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
        return next(createHttpError(401, "Invalid or expired access token"));
      }
      throw err;
    }

    const sub = typeof decoded === "object" && decoded?.sub;
    if (typeof sub !== "string") {
      return next(createHttpError(401, "Invalid token payload: `sub` must be a string"));
    }

    const member = await prisma.member.findUnique({
      where: { id: sub },
      include: { role: true },
    });

    if (!member) {
      return next(createHttpError(404, `Member not found for ID: ${sub}`));
    }

    // Remove sensitive fields if needed
    req.member = { ...member, password: "" };

    next();
  } catch (error) {
    next(createHttpError(500, "Authentication middleware error", { cause: error }));
  }
};

export default authenticate;
